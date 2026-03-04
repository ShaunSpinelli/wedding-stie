import { getAssetPath } from "@/utils/asset-path";
import { useLanguage } from "@/lib/language-context";

export const InvitationCard = ({ isEnvelopeOpen }) => {
  const { language } = useLanguage();

  // Select image based on language
  const inviteImage =
    language === "fr" ? "/save-the-date-fr.jpeg" : "/save-the-date-en.jpeg";

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
          src={getAssetPath(inviteImage)}
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
