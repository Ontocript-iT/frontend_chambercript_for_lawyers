declare module 'react-quill' {
    import * as React from 'react';
    
    // This tells TypeScript: "ReactQuill is a standard React Component that accepts any props"
    const ReactQuill: React.ComponentType<any>;
    export default ReactQuill;
}