/**
 * Agrega marca de agua "Xolonica.store" a una imagen
 */
export async function addWatermark(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Crear canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del canvas'));
          return;
        }
        
        // Establecer dimensiones del canvas
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Dibujar la imagen original
        ctx.drawImage(img, 0, 0);
        
        // Configurar marca de agua
        const fontSize = Math.max(img.width / 20, 20);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.strokeStyle = 'rgba(0, 56, 147, 0.5)';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Dibujar marca de agua en el centro
        const text = 'Xolonica.store';
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        
        // Convertir canvas a blob y luego a File
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('No se pudo crear el blob'));
            return;
          }
          
          const watermarkedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          
          resolve(watermarkedFile);
        }, file.type);
      };
      
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}
