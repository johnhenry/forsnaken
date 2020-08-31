0. Game(:?)
   1.0 ImageDataEmitter(:?):ImageData
   1.1 GeometryEmitter(:?):Geometry
   1.1.1 VertexShader(:Geometry):Geometry _
   1.1.2 GeometryShader(:Geometry):Geometry _
   1.1.3 TesselationShader(:Geometry): Geometry \*
   1.2 FinalShader(:Geometry):ImageData
1. PixelShader(:ImageData):ImageData \*
2. Image Data Renderer(:ImageData):void
