import { useState, useCallback, useRef } from "react";

const AVATAR_COLORS = [
  "#f02424",
  "#f7de40",
  "#6cabad",
  "#375dde",
  "#8148dd",
  "#ffcfe9",
  "#ae7cff",
];

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface StepNameAvatarProps {
  agentName: string;
  selectedLogoUrl: string | null;
  customAvatars: string[];
  logosData: { small: string[]; large: string[] } | undefined;
  isLoadingLogos: boolean;
  isUploading: boolean;
  uploadError: boolean;
  onAgentNameChange: (name: string) => void;
  onAvatarSelect: (url: string) => void;
  onAvatarUpload: (file: File) => void;
  onBack: () => void;
  onNext: () => void;
}

function AvatarItem({
  url,
  index,
  isSelected,
  bgColor,
  onSelect,
}: {
  url: string;
  index: number;
  isSelected: boolean;
  bgColor: string;
  onSelect: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const handleLoad = useCallback(() => setIsLoaded(true), []);

  return (
    <button
      className={`aspect-square w-full overflow-hidden transition-all duration-200 relative ${
        isSelected
          ? "border-2 border-[#6ce182]"
          : "border border-white/10 hover:border-white/30"
      }`}
      style={{ backgroundColor: bgColor }}
      title={`Avatar ${index + 1}`}
      type="button"
      onClick={onSelect}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-eva-border/50 animate-pulse" />
      )}
      <img
        alt={`Avatar ${index + 1}`}
        className={`w-full h-full object-cover object-top transition-opacity duration-200 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        src={url}
        onLoad={handleLoad}
      />
    </button>
  );
}

function AddAvatarButton({
  onUpload,
  isUploading,
  uploadError,
}: {
  onUpload: (file: File) => void;
  isUploading: boolean;
  uploadError: string | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      alert("Unsupported format. Please upload JPG, PNG, GIF, or WebP.");

      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("File too large. Max size is 5 MB.");

      return;
    }
    onUpload(file);
    e.target.value = "";
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        className="hidden"
        disabled={isUploading}
        type="file"
        onChange={handleFileChange}
      />
      <button
        className={`aspect-square w-full bg-[#080a12] border flex items-center justify-center transition-colors ${
          isUploading
            ? "border-[#6ce182]/50 cursor-wait"
            : uploadError
              ? "border-red-500 hover:border-red-400"
              : "border-white/10 hover:border-white/30"
        }`}
        disabled={isUploading}
        title={uploadError || "Upload custom avatar"}
        type="button"
        onClick={handleClick}
      >
        {isUploading ? (
          <svg
            className="animate-spin"
            fill="none"
            height="24"
            viewBox="0 0 24 24"
            width="24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="white"
              strokeOpacity="0.25"
              strokeWidth="3"
            />
            <path
              d="M12 2C6.48 2 2 6.48 2 12"
              stroke="white"
              strokeLinecap="round"
              strokeWidth="3"
            />
          </svg>
        ) : (
          <svg fill="none" height="24" viewBox="0 0 24 24" width="24">
            <path
              d="M12 5V19M5 12H19"
              stroke="white"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

export function StepNameAvatar({
  agentName,
  selectedLogoUrl,
  customAvatars,
  logosData,
  isLoadingLogos,
  isUploading,
  uploadError,
  onAgentNameChange,
  onAvatarSelect,
  onAvatarUpload,
  onBack,
  onNext,
}: StepNameAvatarProps) {
  const isStepValid = agentName.trim() && selectedLogoUrl;

  const selectedIndex =
    logosData?.small?.findIndex((url) => url === selectedLogoUrl) ?? 0;
  const selectedLargeLogoUrl =
    selectedIndex >= 0 && logosData?.large?.[selectedIndex]
      ? logosData.large[selectedIndex]
      : selectedLogoUrl;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-6 items-stretch">
        {/* Left — Avatar Preview */}
        <div className="shrink-0 w-[340px]">
          <div
            className="relative w-full aspect-square border border-[#6ce182] overflow-hidden"
            style={{ background: "black" }}
          >
            {selectedLargeLogoUrl && (
              <img
                alt="Selected avatar"
                className="absolute inset-0 w-full h-full object-cover object-center"
                src={selectedLargeLogoUrl}
              />
            )}
          </div>
        </div>

        {/* Right — Form */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Avatar Grid */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
              Select Avatar
            </label>
            <div className="flex flex-col gap-3">
              {isLoadingLogos ? (
                <>
                  <div className="grid grid-cols-7 gap-3">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={`sk1-${i}`}
                        className="aspect-square bg-eva-border/50 animate-pulse"
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-3">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={`sk2-${i}`}
                        className="aspect-square bg-eva-border/50 animate-pulse"
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-3">
                    {logosData?.small
                      ?.slice(0, 7)
                      .map((url, i) => (
                        <AvatarItem
                          key={`r1-${i}`}
                          bgColor={AVATAR_COLORS[i % AVATAR_COLORS.length]}
                          index={i}
                          isSelected={selectedLogoUrl === url}
                          url={url}
                          onSelect={() => onAvatarSelect(url)}
                        />
                      ))}
                  </div>
                  <div className="grid grid-cols-7 gap-3">
                    {logosData?.small
                      ?.slice(7, 13)
                      .map((url, i) => (
                        <AvatarItem
                          key={`r2-${i}`}
                          bgColor={
                            AVATAR_COLORS[(i + 7) % AVATAR_COLORS.length]
                          }
                          index={i + 7}
                          isSelected={selectedLogoUrl === url}
                          url={url}
                          onSelect={() => onAvatarSelect(url)}
                        />
                      ))}
                    {customAvatars.map((url, i) => (
                      <AvatarItem
                        key={`custom-${i}`}
                        bgColor="#1a1a2e"
                        index={13 + i}
                        isSelected={selectedLogoUrl === url}
                        url={url}
                        onSelect={() => onAvatarSelect(url)}
                      />
                    ))}
                    <AddAvatarButton
                      isUploading={isUploading}
                      uploadError={uploadError ? "Upload failed" : null}
                      onUpload={onAvatarUpload}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Agent Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">
              Agent Name
            </label>
            <div className="bg-black border border-[#374151]">
              <input
                className="w-full px-[17px] py-[19px] bg-transparent text-sm font-medium text-white placeholder:text-[#4b5563] focus:outline-none"
                maxLength={20}
                placeholder="e.g. Eva.1"
                type="text"
                value={agentName}
                onChange={(e) => onAgentNameChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          className="h-[44px] px-6 border border-[#374151] text-sm font-medium text-[#9ca3af] rounded hover:border-white/30 hover:text-white transition-colors"
          type="button"
          onClick={onBack}
        >
          BACK
        </button>
        <button
          className="h-[44px] px-8 bg-[#6ce182] text-sm font-semibold text-black rounded hover:bg-[#5bd174] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isStepValid}
          type="button"
          onClick={onNext}
        >
          NEXT
        </button>
      </div>
    </div>
  );
}
