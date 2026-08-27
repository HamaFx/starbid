import { NextResponse } from "next/server";

export function GET() {
  const script = `(function(){var s=document.currentScript;if(!s)return;var f=document.createElement('iframe');f.src=new URL('/api/embed',s.src).href;f.title='StarBid live galaxy';f.loading='lazy';f.style.cssText='width:100%;min-height:260px;border:0;border-radius:12px';s.parentNode.insertBefore(f,s);})();`;
  return new NextResponse(script, { headers: { "Content-Type": "application/javascript; charset=utf-8", "Cache-Control": "public, max-age=3600", "Access-Control-Allow-Origin": "*" } });
}
