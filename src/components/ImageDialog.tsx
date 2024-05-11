import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CarouselApi } from "@/components/CarouselApi";

interface ImageDialogProps {
  images: { src: string; alt?: string }[];
  title: string;
}

export const ImageDialog: React.FC<ImageDialogProps> = ({ images, title }) => {
  return (
    <div className="mt-8">
      <Dialog>
        {images.length === 1 ? (
          <DialogTrigger>
            <img
              src={images[0].src}
              alt={images[0].alt}
              className="rounded-md cursor-pointer w-full"
            />
          </DialogTrigger>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {images.slice(0, 2).map((image, index) => (
                <DialogTrigger key={index}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="rounded-md cursor-pointer"
                  />
                </DialogTrigger>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {images.slice(2, 4).map((image, index) => (
                <DialogTrigger key={index}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="rounded-md cursor-pointer"
                  />
                </DialogTrigger>
              ))}
              {images.length > 4 && (
                <DialogTrigger>
                  <div className="relative cursor-pointer">
                    <img
                      src={images[4].src}
                      alt={images[4].alt}
                      className="rounded-md"
                    />
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center text-white font-bold text-2xl rounded-md">
                      +{images.length - 5}
                    </div>
                  </div>
                </DialogTrigger>
              )}
            </div>
          </>
        )}
        <DialogContent className="max-w-[60vw]">
          <CarouselApi images={images} />
        </DialogContent>
      </Dialog>
    </div>
  );
};