import { motion } from "framer-motion";
import { getAssetPath } from "@/utils/asset-path";

export const InvitationCard = ({ isEnvelopeOpen }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center">
      <div 
        className={`
          relative w-full aspect-[5/7] rounded-sm shadow-2xl overflow-hidden
          transition-all duration-1000 bg-white
          ${isEnvelopeOpen ? "scale-100" : "scale-95"}
        `}
      >
        {/* Static Image Invitation */}
        <img
          src={getAssetPath("/save-the-date.jpg")}
          alt="Wedding Invitation"
          className="w-full h-full object-cover select-none pointer-events-none"
        />
        
        {/* Subtle Paper Texture Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-multiply"
          style={{ 
            backgroundImage: `url('${getAssetPath("/textures/oldpaper.webp")}')`,
            backgroundSize: "cover",
          }}
        />
        
        {/* Soft edge shadow for depth */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.05)]" />
      </div>
    </div>
  );
};
