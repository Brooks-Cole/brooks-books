  import driver from '../config/neo4j.js';

  class GraphService {
    // Core Book Methods
    async addBook(bookData) {
      const session = driver.session();
      try {
        console.log('Adding book to Neo4j:', {
          title: bookData.title,
          author: bookData.author
        });
    
        // Helper function to detect series from title
        const detectSeries = (title) => {
          // Common series indicators
          const seriesPatterns = [
            { regex: /Hardy Boys/i, name: 'The Hardy Boys Series' },
            { regex: /Redwall/i, name: 'Redwall Series' },
            { regex: /(Book|Volume)\s+\d+/i, extractName: (title) => {
              // Extract series name from "Book X" or "Volume X" format
              return title.split(':')[0].trim();
            }},
            // Add more patterns as needed
          ];
    
          for (const pattern of seriesPatterns) {
            if (pattern.regex.test(title)) {
              if (pattern.extractName) {
                return pattern.extractName(title);
              }
              return pattern.name;
            }
          }
          
          // Check for colon-based series titles (e.g., "Series Name: Book Title")
          if (title.includes(':')) {
            return title.split(':')[0].trim();
          }
    
          return null;
        };
    
        const result = await session.writeTransaction(async tx => {
          // Original book creation query
          const bookQuery = `
            MERGE (b:Book {id: $bookId})
            SET b.title = $title,
                b.description = $description,
                b.minAge = $minAge,
                b.maxAge = $maxAge,
                b.addedAt = $addedAt
            
            WITH b
            
            // Clear existing relationships
            OPTIONAL MATCH (b)-[r]-()
            DELETE r
            
            WITH b
            MERGE (a:Author {name: $author})
            MERGE (b)-[:WRITTEN_BY]->(a)
            
            WITH b
            UNWIND $genres as genreName
            WITH b, genreName
            WHERE genreName IS NOT NULL AND trim(genreName) <> ''
            MERGE (g:Genre {name: genreName})
            MERGE (b)-[:IN_GENRE]->(g)
            
            WITH b
            UNWIND $tags as tagName
            WITH b, tagName
            WHERE tagName IS NOT NULL AND trim(tagName) <> ''
            MERGE (t:Tag {name: trim(tagName)})
            MERGE (b)-[:HAS_TAG]->(t)
            
            // Add automatic series detection
            WITH b, $title as title
            CALL {
              WITH b, title
              WITH b, title, $detectedSeries as seriesName
              WHERE seriesName IS NOT NULL
              MERGE (s:Series {name: seriesName})
              MERGE (b)-[:PART_OF]->(s)
            }
            
            RETURN b
          `;
    
          const detectedSeries = detectSeries(bookData.title);
          console.log('Detected series:', detectedSeries);
    
          return await tx.run(bookQuery, {
            bookId: bookData._id.toString(),
            title: bookData.title,
            author: bookData.author,
            description: bookData.description || '',
            minAge: bookData.ageRange?.min || 8,
            maxAge: bookData.ageRange?.max || 15,
            addedAt: bookData.addedAt?.toISOString() || new Date().toISOString(),
            genres: Array.isArray(bookData.genres) ? bookData.genres.filter(g => g) : [],
            tags: Array.isArray(bookData.tags) ? bookData.tags.filter(t => t) : [],
            detectedSeries: detectedSeries
          });
        });
    
        return result.records[0];
      } catch (error) {
        console.error('Error adding book:', error);
        throw error;
      } finally {
        await session.close();
      }
    }

    // Series Methods
    async getSeriesData(seriesName) {
      const session = driver.session();
      try {
        const result = await session.readTransaction(async tx => {
          const query = `
            MATCH (s:Series {name: $seriesName})<-[:PART_OF]-(b:Book)
            RETURN s.name as name,
                  collect({
                    id: b.id,
                    title: b.title,
                    drawingCount: b.drawingCount,
                    likeCount: b.likeCount
                  }) as books
          `;
          return await tx.run(query, { seriesName });
        });
        return result.records[0]?.get('books') || [];
      } finally {
        await session.close();
      }
    }

    async addOrUpdateSeries(seriesData) {
      const session = driver.session();
      try {
        await session.writeTransaction(async tx => {
          const query = `
            MERGE (s:Series {name: $name})
            SET s.description = $description,
                s.bookCount = $bookCount
            WITH s
            
            UNWIND $books as book
            MATCH (b:Book {id: book.id})
            MERGE (b)-[:PART_OF]->(s)
            
            WITH s
            UNWIND $genres as genre
            MERGE (g:Genre {name: genre})
            MERGE (s)-[:IN_GENRE]->(g)
          `;
    
          await tx.run(query, {
            name: seriesData.name,
            description: seriesData.description,
            bookCount: seriesData.books.length,
            books: seriesData.books,
            genres: seriesData.genres
          });
        });
      } catch (error) {
        console.error('Error adding/updating series:', error);
        throw error;
      } finally {
        await session.close();
      }
    }

    // Recommendation Methods
    async findSimilarBooks(bookId) {
      if (!bookId) throw new Error('No bookId provided');
      console.log('Finding similar books for:', bookId);
      const session = driver.session();
      try {
        const result = await session.readTransaction(async tx => {
          const query = `
            MATCH (b:Book {id: $bookId})
            WITH b

            // Find similar books by genre
            OPTIONAL MATCH (b)-[:IN_GENRE]->(g:Genre)<-[:IN_GENRE]-(otherByGenre:Book)
            WHERE b <> otherByGenre
            WITH b, collect(DISTINCT otherByGenre) AS similarByGenre

            // Find similar books by author
            OPTIONAL MATCH (b)-[:WRITTEN_BY]->(a:Author)<-[:WRITTEN_BY]-(otherByAuthor:Book)
            WHERE b <> otherByAuthor
            WITH b, similarByGenre, collect(DISTINCT otherByAuthor) AS similarByAuthor

            // Combine results and calculate a simple similarity score
            UNWIND similarByGenre AS similarBook
            WITH b, similarBook, 1 AS genreSimilarity, null as authorSimilarity
            UNION
            UNWIND similarByAuthor AS similarBook
            WITH b, similarBook, null as genreSimilarity, 1 as authorSimilarity

            WITH b, similarBook, sum(genreSimilarity) as genreSimilarity, sum(authorSimilarity) as authorSimilarity
            SET similarBook.similarityScore = genreSimilarity + authorSimilarity // Combine similarity scores (you can adjust weights)

            RETURN similarBook.title AS title, similarBook.id AS id, similarBook.similarityScore AS similarityScore
            ORDER BY similarBook.similarityScore DESC
          `;
          return await tx.run(query, { bookId: bookId.toString() });
        });

        return result.records.map(record => ({
          title: record.get('title'),
          id: record.get('id'),
          similarityScore: record.get('similarity')
        }));
      } finally {
        await session.close();
      }
    }

    async findBooksByTag(tag) {
      const session = driver.session();
      try {
        const result = await session.readTransaction(async tx => {
          const query = `
            MATCH (b:Book)-[:HAS_TAG]->(t:Tag {name: $tag})
            RETURN b.title as title, b.id as id
          `;
          return await tx.run(query, { tag });
        });

        return result.records.map(record => ({
          title: record.get('title'),
          id: record.get('id')
        }));
      } finally {
        await session.close();
      }
    }

    // Graph Visualization Methods
    async getFullGraph(filters = {}) {
      const session = driver.session();
      try {
        console.log('Getting full graph with filters:', filters);

        const relationshipTypes = filters.relationshipTypes || [];
        
        const result = await session.readTransaction(async tx => {
          const query = `
            // First get all books
            MATCH (b:Book)
            WITH collect(b) as books
            
            // Then get connected nodes and relationships
            MATCH (n)
            WHERE n:Book OR n:Author OR n:Genre OR n:Tag OR n:Series
            WITH n, books
            OPTIONAL MATCH (n)-[r]-(m)
            WHERE (n:Book AND (m:Author OR m:Genre OR m:Tag OR m:Series))
              OR (n:Author AND m:Book)
              OR (n:Genre AND m:Book)
              OR (n:Tag AND m:Book)
              OR (n:Series AND m:Book)
            
            // Return both nodes and relationships
            RETURN {
              nodes: collect(DISTINCT {
                id: CASE 
                  WHEN n:Book THEN n.id 
                  ELSE toString(id(n)) 
                END,
                type: labels(n)[0],
                name: CASE labels(n)[0]
                  WHEN 'Book' THEN n.title
                  ELSE n.name
                END,
                properties: properties(n)
              }),
              links: collect(DISTINCT {
                source: CASE 
                  WHEN startNode(r):Book THEN startNode(r).id 
                  ELSE toString(id(startNode(r))) 
                END,
                target: CASE 
                  WHEN endNode(r):Book THEN endNode(r).id 
                  ELSE toString(id(endNode(r))) 
                END,
                type: type(r)
              })
            } as graph
          `;

          const result = await tx.run(query);
          console.log('Neo4j Query Result:', {
            records: result.records.length,
            firstRecord: result.records[0]?.get('graph')
          });
          
          return result;
        });

        const graphData = result.records[0].get('graph');
        
        console.log('Graph Service Response:', {
          nodeCount: graphData.nodes.length,
          bookCount: graphData.nodes.filter(n => n.type === 'Book').length,
          linkCount: graphData.links.length,
          sampleBook: graphData.nodes.find(n => n.type === 'Book'),
          sampleLink: graphData.links[0]
        });

        return graphData;
      } catch (error) {
        console.error('Error getting full graph:', error);
        throw error;
      } finally {
        await session.close();
      }
    }

    async checkGraphState() {
      const session = driver.session();
      try {
        const result = await session.readTransaction(async tx => {
          const query = `
            MATCH (n)-[r]-(m)
            RETURN count(r) as relationshipCount,
                  collect(DISTINCT type(r)) as relationshipTypes,
                  count(DISTINCT n) as connectedNodeCount
          `;
          return await tx.run(query);
        });
        
        const stats = result.records[0];
        console.log('Graph Database Stats:', {
          relationshipCount: stats.get('relationshipCount').toNumber(),
          relationshipTypes: stats.get('relationshipTypes'),
          connectedNodeCount: stats.get('connectedNodeCount').toNumber()
        });
        
        return stats;
      } finally {
        await session.close();
      }
    }

    // Utility Methods
    getNodeColor(nodeType) {
      const colors = {
        'Book': '#4287f5',    // blue
        'Author': '#42f554',  // green
        'Genre': '#f54242',   // red
        'Tag': '#f5d742',     // yellow
        'Series': '#9d42f5'   // purple
      };
      return colors[nodeType] || '#999999';
    }

    getNodeSize(node) {
      if (node.type === 'Book') {
        const engagement = (node.properties.drawingCount || 0) + 
                          (node.properties.likeCount || 0) + 
                          (node.properties.commentCount || 0);
        return 8 + Math.min(engagement, 12);
      }
      return 8;
    }

    getLinkColor(relationshipType) {
      const colors = {
        'WRITTEN_BY': '#666666',  // Dark gray
        'IN_GENRE': '#999999',    // Medium gray
        'HAS_TAG': '#CCCCCC',     // Light gray
        'PART_OF': '#FF69B4'      // Pink for series relationships
      };
      return colors[relationshipType] || '#EEEEEE';
    }

    // Maintenance Methods
    async cleanupOrphanedTags() {
      const session = driver.session();
      try {
        return await session.writeTransaction(async tx => {
          const cleanupQuery = `
            MATCH (t:Tag)
            WHERE NOT (t)--()
            DELETE t
            RETURN count(t) as deletedTags
          `;
          return await tx.run(cleanupQuery);
        });
      } finally {
        await session.close();
      }
    }

    async relinkTags(bookData) {
      const session = driver.session();
      try {
        await session.writeTransaction(async tx => {
          const relinkQuery = `
            MATCH (b:Book {id: $bookId})
            OPTIONAL MATCH (b)-[r:HAS_TAG]->()
            DELETE r
            WITH b
            UNWIND $tags as tag
            WHERE tag IS NOT NULL AND trim(tag) <> ''
            MERGE (t:Tag {name: trim(tag)})
            MERGE (b)-[:HAS_TAG]->(t)
          `;

          await tx.run(relinkQuery, {
            bookId: bookData._id.toString(),
            tags: bookData.tags || []
          });
        });
      } finally {
        await session.close();
      }
    }
  }

  export default new GraphService();