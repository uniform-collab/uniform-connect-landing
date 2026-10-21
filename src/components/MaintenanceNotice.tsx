import { ComponentProps, UniformRichText, UniformText } from "@uniformdev/canvas-react";
import type { AssetParamValue } from "@uniformdev/assets";

type MaintenanceNoticeProps = ComponentProps<{
  logo?: AssetParamValue;
  headline: string;
  message?: string;
  statusLabel?: string;
  ctaLabel?: string;
  ctaLink?: { path?: string };
  footerNote?: string;
}>;

// Pointy-top hexagon split into three isometric faces, echoing the Uniform mark.
// Each face eases outward in turn, exposing the red core: "work in progress".
const HexMotif = () => (
  <svg className="mx-hex" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
    <polygon
      className="mx-hex__ring"
      points="200,-8 380.13,96 380.13,304 200,408 19.87,304 19.87,96"
    />
    <polygon className="mx-hex__core" points="200,130 260.62,165 260.62,235 200,270 139.38,235 139.38,165" />
    <polygon className="mx-hex__face mx-hex__face--top" points="200,40 338.56,120 200,200 61.44,120" />
    <polygon className="mx-hex__face mx-hex__face--left" points="61.44,120 200,200 200,360 61.44,280" />
    <polygon className="mx-hex__face mx-hex__face--right" points="200,200 338.56,120 338.56,280 200,360" />
  </svg>
);

const MaintenanceNotice: React.FC<MaintenanceNoticeProps> = ({ logo, ctaLink }) => {
  const logoUrl = logo?.[0]?.fields?.url?.value;
  const href = ctaLink?.path;

  return (
    <section className="mx" aria-labelledby="mx-headline">
      <header className="mx__header">
        {logoUrl && <img className="mx__logo" src={logoUrl} alt="Uniform" width={152} height={48} />}
      </header>

      <div className="mx__body">
        <div className="mx__art">
          <HexMotif />
        </div>

        <div className="mx__copy">
          <UniformText
            parameterId="headline"
            as="h1"
            id="mx-headline"
            className="mx__headline"
            placeholder="Uniform Connect is down for maintenance"
          />
          <UniformRichText parameterId="message" className="mx__message" placeholder="Explain what is happening" />

          <div className="mx__actions">
            <p className="mx__status" role="status">
              <span className="mx__pip" aria-hidden="true" />
              <UniformText parameterId="statusLabel" as="span" placeholder="Maintenance in progress" />
            </p>
            {href && (
              <a className="mx__cta" href={href}>
                <UniformText parameterId="ctaLabel" as="span" placeholder="Visit uniform.dev" />
                <svg className="mx__cta-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      <footer className="mx__footer">
        <UniformText parameterId="footerNote" as="p" placeholder="© Uniform" />
      </footer>
    </section>
  );
};

export default MaintenanceNotice;
