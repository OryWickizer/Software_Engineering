
import React from 'react'

const Footer = () => {
  return (
      <footer className="border-t bg-background">
      <div className="container py-10 grid gap-4 md:grid-cols-2 items-center mx-auto">
        <div className="space-y-2">
          <p className="text-sm text-foreground/60">EcoBites — Helping You, Help the Planet</p>
          <p className="text-xs text-foreground/50">Group 22 · Ory Wickizer · Stephen Liu · Yash Dive · Atharva Waingankar</p>
        </div>
        <p className="text-xs md:text-right text-foreground/50">© {new Date().getFullYear()} EcoBites. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer

