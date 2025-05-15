import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showTagline?: boolean
  className?: string
}

export function Logo({ size = "md", showTagline = true, className = "" }: LogoProps) {
  const sizes = {
    sm: { width: 100, height: 40 },
    md: { width: 150, height: 60 },
    lg: { width: 200, height: 80 },
  }

  return (
    <Link href="/" className={`block ${className}`}>
      <div className="relative">
        <Image
          src="/ghantaa_logo.png"
          alt="Ghantaa - Time Tracking"
          width={sizes[size].width}
          height={sizes[size].height}
          priority
          className="object-contain"
        />
      </div>
    </Link>
  )
}
