import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

// Função utilitária para extrair o recorte usando Canvas
const getImagemRecortada = async (imageSrc: string, pixelCrop: any): Promise<string> => {
  const image = new Image();
  image.src = imageSrc;
  
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // Redimensiona a imagem recortada para no máximo 500x500 px
  const MAX_SIZE = 500;
  let targetWidth = pixelCrop.width;
  let targetHeight = pixelCrop.height;

  if (targetWidth > MAX_SIZE || targetHeight > MAX_SIZE) {
    if (targetWidth > targetHeight) {
      targetHeight = (MAX_SIZE / targetWidth) * targetHeight;
      targetWidth = MAX_SIZE;
    } else {
      targetWidth = (MAX_SIZE / targetHeight) * targetWidth;
      targetHeight = MAX_SIZE;
    }
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  // Retorna a imagem em Base64
  return canvas.toDataURL('image/jpeg', 0.85); // Salva em JPEG com 85% de qualidade
};

interface RecorteAvatarProps {
  imagemOriginal: string;
  aoSalvar: (base64: string) => void;
  aoCancelar: () => void;
}

export const RecorteAvatar = ({ imagemOriginal, aoSalvar, aoCancelar }: RecorteAvatarProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaRecortada, setAreaRecortada] = useState(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setAreaRecortada(croppedAreaPixels);
  }, []);

  const handleSalvar = async () => {
    if (imagemOriginal && areaRecortada) {
      const base64Crop = await getImagemRecortada(imagemOriginal, areaRecortada);
      aoSalvar(base64Crop);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="bg-white p-4 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Ajustar Foto de Perfil</h2>
        
        <div className="relative w-full h-64 bg-gray-200">
          <Cropper
            image={imagemOriginal}
            crop={crop}
            zoom={zoom}
            aspect={1} 
            cropShape="round" 
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        
        <div className="mt-4 flex gap-2 justify-end">
          <button onClick={aoCancelar} className="px-4 py-2 text-gray-600 border border-gray-300 rounded">
            Cancelar
          </button>
          <button onClick={handleSalvar} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Aplicar Recorte
          </button>
        </div>
      </div>
    </div>
  );
};
