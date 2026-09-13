# Image-Compression-Tool-Using-Machine-Learning-K-means-Algorithm-



How the ML pipeline works:

Every pixel is represented as a 3D coordinate in RGB space.

The K-Means algorithm automatically discovers the top $K$ most representative cluster centroids (colors) across the image.

By replacing thousands of individual pixel colors with their closest centroid indices, the image can be represented using a compact color palette—significantly reducing the theoretical bit footprint while preserving the core visual structure.





The Tech Stack:

ML Engine: Pure NumPy (vectorized distance calculations, iterative centroid reassignment, and quantization. Reference from Stanford University Unsupervised ML Course)



Backend: FastAPI, Pillow (PIL), and Uvicorn for lightweight, asynchronous image handling and API responses



Frontend: React (Vite) and Tailwind CSS with an interactive before/after split slider, compression metrics, and dynamic palette extraction



Taking a core mathematical algorithm from theory to a responsive full-stack application was a great exercise in understanding both algorithmic bottlenecks and end-to-end software integration.



IDEs Used: Visual Studio Code, Cursor 
