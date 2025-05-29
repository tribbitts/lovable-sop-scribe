
import React from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface CropImageProps {
  crop: Crop | undefined;
  onCropChange: (c: Crop) => void;
  onCropComplete: (c: any) => void;
  aspect: number;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  imageUrl: string;
  imageRef: React.RefObject<HTMLImageElement>;
}

const CropImage: React.FC<CropImageProps> = ({
  crop,
  onCropChange,
  onCropComplete,
  aspect,
  onImageLoad,
  imageUrl,
  imageRef,
}) => {
  return (
    <div className="flex justify-center p-4 bg-zinc-800 rounded-md overflow-hidden">
      <ReactCrop
        crop={crop}
        onChange={onCropChange}
        onComplete={onCropComplete}
        aspect={aspect}
        className="max-h-[50vh] object-contain"
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Screenshot to crop"
          onLoad={onImageLoad}
          className="max-w-full h-auto"
          style={{ maxHeight: "50vh" }}
        />
      </ReactCrop>
    </div>
  );
};

export default CropImage;
