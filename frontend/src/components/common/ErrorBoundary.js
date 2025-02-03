// frontend/src/components/common/ErrorBoundary.js
// import React from 'react';
// import { Alert, Box, Button, Paper, Typography } from '@mui/material';

// class ErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { 
//       hasError: false,
//       error: null,
//       errorInfo: null
//     };
//   }

//   static getDerivedStateFromError(error) {
//     return { hasError: true };
//   }

//   componentDidCatch(error, errorInfo) {
//     // Log the error to your preferred logging service
//     console.error('Error caught by boundary:', error);
//     console.error('Error stack trace:', errorInfo);

//     this.setState({
//       error: error,
//       errorInfo: errorInfo
//     });
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <Box 
//           sx={{ 
//             p: 3,
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             gap: 2
//           }}
//         >
//           <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
//             Something went wrong in this part of the application.
//           </Alert>

//           <Paper sx={{ p: 3, width: '100%', maxWidth: 800 }}>
//             <Typography variant="h6" color="error" gutterBottom>
//               Error Details:
//             </Typography>
//             <Typography variant="body2" component="pre" sx={{ 
//               whiteSpace: 'pre-wrap',
//               backgroundColor: 'grey.100',
//               p: 2,
//               borderRadius: 1,
//               overflow: 'auto',
//               maxHeight: '200px'
//             }}>
//               {this.state.error && this.state.error.toString()}
//             </Typography>

//             {this.state.errorInfo && (
//               <>
//                 <Typography variant="h6" color="error" sx={{ mt: 2, mb: 1 }}>
//                   Stack Trace:
//                 </Typography>
//                 <Typography variant="body2" component="pre" sx={{ 
//                   whiteSpace: 'pre-wrap',
//                   backgroundColor: 'grey.100',
//                   p: 2,
//                   borderRadius: 1,
//                   overflow: 'auto',
//                   maxHeight: '400px'
//                 }}>
//                   {this.state.errorInfo.componentStack}
//                 </Typography>
//               </>
//             )}
//           </Paper>

//           <Button 
//             variant="contained" 
//             onClick={() => window.location.reload()}
//             sx={{ mt: 2 }}
//           >
//             Reload Page
//           </Button>
//         </Box>
//       );
//     }

//     return this.props.children;
//   }
// }

// export default ErrorBoundary;