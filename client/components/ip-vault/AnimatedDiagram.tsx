import { motion, AnimatePresence } from "framer-motion";
import { User2, ShieldCheck, Check, Cpu } from "lucide-react";

export function AnimatedDiagram({ active }: { active: number }) {
  const width = 1200;
  const height = 360;

  const isUpload = active === 0; // Upload Data
  const isEncrypt = active === 1; // Encrypt File
  const isLicense = active === 4; // License & Access
  const isTEE = active === 5; // Conditional Decryption
  const isAccess = active === 6; // Access File

  return (
    <div className="relative mx-auto mt-4 w-full max-w-5xl">
      <div
        className="absolute -inset-6 rounded-2xl bg-[radial-gradient(1200px_300px_at_50%_0%,hsl(75_95%_65%_/_0.25),transparent_60%)]"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-black/60 shadow-[0_0_0_1px_hsl(var(--border)/0.3),0_10px_40px_hsl(75_95%_65%_/_0.15)]">
        <motion.svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          initial={false}
        >
          {/* Background grid tint */}
          <defs>
            <linearGradient id="vaultGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#D7FF57" />
              <stop offset="100%" stopColor="#9BE15D" />
            </linearGradient>
          </defs>

          {/* Nodes positions */}
          {/* Owner */}
          <g transform={`translate(140,180)`}>
            <circle r="46" fill="#1F2937" stroke="#334155" />
            <User2 x={-18} y={-18} width={36} height={36} color="#CBD5E1" />
            <rect
              x={-70}
              y={58}
              rx={18}
              ry={18}
              width={140}
              height={36}
              fill="#99B8FF"
            />
            <text
              x={0}
              y={82}
              textAnchor="middle"
              fontWeight="600"
              fill="#0F172A"
              fontSize="16"
            >
              IP OWNER
            </text>
          </g>

          {/* Vault */}
          <g transform={`translate(600,180)`}>
            <motion.rect
              x={-170}
              y={-90}
              rx={36}
              width={340}
              height={180}
              fill="url(#vaultGrad)"
              initial={false}
              animate={{
                filter: (isEncrypt
                  ? "drop-shadow(0 0 24px rgba(215,255,87,0.45))"
                  : "drop-shadow(0 0 0 rgba(0,0,0,0))") as any,
              }}
            />
            <g>
              <rect
                x={-26}
                y={-26}
                width={52}
                height={52}
                rx={10}
                fill="#0F172A"
                opacity="0.8"
              />
              <image
                x={-16}
                y={-16}
                width={32}
                height={32}
                href="https://cdn.builder.io/api/v1/image/assets%2F45b51cbd16f1407caa5463a5ffd74106%2F1fb9fcb5c7b44919b4aa9abd73481a1f?format=webp&width=800"
                preserveAspectRatio="xMidYMid meet"
              />
            </g>
            <text
              x={0}
              y={80}
              textAnchor="middle"
              fontWeight="600"
              fill="#0F172A"
              fontSize="20"
            >
              Vault
            </text>
          </g>

          {/* TEE */}
          <g transform={`translate(900,180)`}>
            <motion.rect
              x={-45}
              y={-45}
              width={90}
              height={90}
              fill="#172554"
              stroke="#94A3B8"
              transform="rotate(45)"
              animate={{ rotate: isTEE ? 225 : 45 }}
              transition={{ type: "spring", stiffness: 70, damping: 12 }}
            />
            <Cpu x={-16} y={-16} width={32} height={32} color="#FDE047" />
            <text
              x={0}
              y={80}
              textAnchor="middle"
              fontWeight="600"
              fill="#E2E8F0"
              fontSize="14"
            >
              TEE
            </text>
          </g>

          {/* Buyer */}
          <g transform={`translate(1060,180)`}>
            <circle r="46" fill="#1F2937" stroke="#334155" />
            <User2 x={-18} y={-18} width={36} height={36} color="#CBD5E1" />
            <rect
              x={-62}
              y={58}
              rx={18}
              ry={18}
              width={124}
              height={36}
              fill="#FFFFFF"
              opacity="0.92"
            />
            <text
              x={0}
              y={82}
              textAnchor="middle"
              fontWeight="600"
              fill="#0F172A"
              fontSize="16"
            >
              IP BUYER
            </text>
          </g>

          {/* Lines */}
          <g stroke="#64748B" strokeWidth={3} strokeLinecap="round">
            <line x1={186} y1={180} x2={430} y2={180} />
            <line x1={770} y1={180} x2={855} y2={180} />
            <line x1={945} y1={180} x2={1014} y2={180} />
          </g>

          {/* Moving packets */}
          <AnimatePresence>
            {isUpload && (
              <motion.circle
                key="packet1"
                r={6}
                fill="#60A5FA"
                initial={{ cx: 186, cy: 180 }}
                animate={{ cx: 430, cy: 180 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
              />
            )}
            {isAccess && (
              <motion.circle
                key="packet2"
                r={6}
                fill="#22D3EE"
                initial={{ cx: 770, cy: 180 }}
                animate={{ cx: 1014, cy: 180 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>

          {/* Condition badges */}
          {/* Write condition near owner */}
          <g transform="translate(260,240)">
            <rect
              width="220"
              height="48"
              rx="12"
              fill="#0B1220"
              opacity="0.8"
              stroke="#334155"
            />
            <text x="16" y="20" fill="#94A3B8" fontSize="12">
              Write access condition:
            </text>
            <g transform="translate(16,28)">
              <Check width={16} height={16} color="#86EFAC" />
              <text x="22" y="14" fill="#E2E8F0" fontSize="13">
                Ownership of IP
              </text>
            </g>
          </g>

          {/* Read conditions near buyer */}
          <g transform="translate(900,240)">
            <rect
              width="260"
              height="72"
              rx="12"
              fill="#0B1220"
              opacity="0.8"
              stroke="#334155"
            />
            <text x="16" y="20" fill="#94A3B8" fontSize="12">
              Read access condition:
            </text>
            <g transform="translate(16,28)">
              <Check width={16} height={16} color="#86EFAC" />
              <text x="22" y="14" fill="#E2E8F0" fontSize="13">
                Valid IP License
              </text>
            </g>
            {isTEE && (
              <g transform="translate(16,46)">
                <Check width={16} height={16} color="#86EFAC" />
                <text x="22" y="14" fill="#E2E8F0" fontSize="13">
                  Valid Remote Attestation
                </text>
              </g>
            )}
          </g>

          {/* Secure labels */}
          <g fill="#94A3B8" fontSize="12" textAnchor="middle">
            <text x={308} y={170}>
              SECURE UPLOAD OF DATA
            </text>
            <text x={980} y={170}>
              SECURE DOWNLOAD OF DATA
            </text>
          </g>

          {/* Shield pulsing when license step */}
          {isLicense && (
            <motion.g
              transform="translate(1045,110)"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <ShieldCheck width={28} height={28} color="#86EFAC" />
            </motion.g>
          )}
        </motion.svg>
      </div>
    </div>
  );
}
