'use client'
import React, { useState, useRef } from 'react';
import { Button } from '@zyra/ui/components/button';
import { X, Plus, Upload } from 'lucide-react';

interface SalonGalleryProps {
  onGalleryChange: (files: File[]) => void;
  maxFiles?: number;
  minFiles?: number;
}

export default function SalonGallery({ onGalleryChange, maxFiles = 6, minFiles = 4 }: SalonGalleryProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (selectedFiles.length + files.length > maxFiles) {
      setError(`Vous ne pouvez ajouter que ${maxFiles} photos maximum.`);
      return;
    }

    // Validate file types
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Seuls les fichiers image sont acceptés.');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newFiles = [...selectedFiles, ...validFiles];
    const newPreviews = [...previews];

    // Create previews for new files
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          setPreviews([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedFiles(newFiles);
    setError('');
    onGalleryChange(newFiles);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onGalleryChange(newFiles);
    
    // Clear error if we're back in valid range
    if (newFiles.length <= maxFiles) {
      setError('');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const isValidGallery = selectedFiles.length >= minFiles && selectedFiles.length <= maxFiles;

  return (
    <div className="space-y-3 lg:space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-800">Galerie du salon</h3>
        <span className="text-xs sm:text-sm text-gray-500">
          {selectedFiles.length}/{maxFiles} photos • Min. {minFiles} requis
        </span>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 lg:p-3">
        <p className="text-xs sm:text-sm text-blue-800">
          <Upload size={14} className="inline mr-2" />
          Ajoutez entre {minFiles} et {maxFiles} photos de votre salon pour mettre en valeur vos espaces.
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
              <img
                src={preview}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <button
              type="button"
              onClick={() => removeFile(index)}
              className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
              aria-label={`Supprimer la photo ${index + 1}`}
            >
              <X size={12} className="lg:w-3.5 lg:h-3.5" />
            </button>
          </div>
        ))}

        {/* Add Photo Button */}
        {selectedFiles.length < maxFiles && (
          <button
            type="button"
            onClick={openFileDialog}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 flex flex-col items-center justify-center text-gray-500 hover:text-gray-600 transition-all duration-200 min-h-[80px] sm:min-h-[100px] lg:min-h-[120px]"
            aria-label="Ajouter une photo"
          >
            <Plus size={16} className="mb-1 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            <span className="text-xs sm:text-sm font-medium">Ajouter</span>
          </button>
        )}
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 lg:p-3">
          <p className="text-xs sm:text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Validation Status */}
      {selectedFiles.length > 0 && (
        <div className={`rounded-lg p-2 lg:p-3 ${isValidGallery ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <p className={`text-xs sm:text-sm ${isValidGallery ? 'text-green-600' : 'text-yellow-600'}`}>
            {isValidGallery 
              ? `✅ Galerie complète (${selectedFiles.length} photos)`
              : `⚠️ Ajoutez ${minFiles - selectedFiles.length} photo(s) supplémentaire(s) minimum`
            }
          </p>
        </div>
      )}

      {/* Instructions détaillées */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 lg:p-4">
        <div className="flex items-start gap-2 lg:gap-3">
          <Upload size={16} className="text-gray-500 mt-0.5 flex-shrink-0 lg:w-5 lg:h-5" />
          <div className="text-xs sm:text-sm text-gray-600">
            <p className="font-medium mb-1 lg:mb-2">Conseils pour vos photos :</p>
            <ul className="space-y-0.5 lg:space-y-1">
              <li>• Formats acceptés : JPG, PNG, JPEG</li>
              <li>• Taille recommandée : 1200x800px minimum</li>
              <li>• Montrez l'intérieur, l'extérieur et l'ambiance</li>
              <li>• Éclairage naturel de préférence</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
