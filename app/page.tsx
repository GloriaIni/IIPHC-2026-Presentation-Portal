"use client";
import { useRef, useState, useCallback, useEffect } from "react";

type PresentationType = "oral" | "poster";
type Step = "form" | "generating" | "download";

export default function PresentingPortal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("form");

  // Input Data States
  const [name, setName] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [topic, setTopic] = useState("");
  const [presType, setPresType] = useState<PresentationType>("oral");
  const [userPhoto, setUserPhoto] = useState<HTMLImageElement | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Background Loading and Splash Guards
  const [posterBase, setPosterBase] = useState<HTMLImageElement | null>(null);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setPosterBase(img);
    };
    img.src = window.location.origin + "/conference-poster.jpg"; 

    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (step === "generating") {
      const gTimer = setTimeout(() => {
        setStep("download");
      }, 2000);
      return () => clearTimeout(gTimer);
    }
  }, [step]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setPhotoPreview(src);
      const img = new window.Image();
      img.onload = () => setUserPhoto(img);
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1440, H = 900;
    canvas.width = W;
    canvas.height = H;

    // 1. Core Background Color - Deep Premium Purple
    ctx.fillStyle = "#1e0030";
    ctx.fillRect(0, 0, W, H);

    // ==========================================
    // LEFT SIDE: SPEAKER PROFILE INFOCARD
    // ==========================================
    const cardX = 20, cardY = 20, cardW = 610, cardH = 860;

    // Base White Card Layer (Top Section Behind Portrait Box)
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 20);
    ctx.fill();



    // Dark Purple Card Header Band
    ctx.fillStyle = "#14011F";
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, 125, [20, 20, 0, 0]);
    ctx.fill();

    // Line 1: Primary Intent Statement
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 25px Arial";
    ctx.textAlign = "center";
    ctx.letterSpacing = "2px";
    ctx.fillText("I WILL BE PRESENTING", cardX + cardW / 2, cardY + 44);

    // Line 2: Bracketed Category Selection Box Container
    const badgeW = 340, badgeH = 38;
    const badgeX = cardX + (cardW - badgeW) / 2;
    const badgeY = cardY + 66;

    ctx.fillStyle = "#FFFFFF"; 
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
    ctx.fill();

    ctx.fillStyle = "#14011F"; 
    ctx.font = "bold 18px Arial";
    ctx.letterSpacing = "0.5px";
    const bracketedBadgeText = presType === "oral" 
      ? "( ORAL PRESENTATION )" 
      : "( POSTER PRESENTATION )";
    ctx.fillText(bracketedBadgeText, cardX + cardW / 2, badgeY + 24);
    ctx.letterSpacing = "0px";

    // Profile Picture Box Dimensions
    const px = cardX + 50, py = cardY + 155, pw = 510, ph = 440;

    // Decorative Canvas Frame Background Elements
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 14);
    ctx.clip();

    ctx.fillStyle = "#3B0764"; 
    ctx.fillRect(px, py, pw, ph);

    ctx.fillStyle = "rgba(255, 0, 127, 0.05)";
    ctx.beginPath();
    ctx.arc(px + 40, py + 50, 60, 0, Math.PI * 2);
    ctx.arc(px + pw - 20, py + ph - 40, 80, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 0, 127, 0.12)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px + 20, py + ph - 20);
    ctx.lineTo(px + 120, py + ph - 120);
    ctx.moveTo(px + pw - 100, py + 20);
    ctx.lineTo(px + pw - 20, py + 100);
    ctx.stroke();
    ctx.restore();

    // Headshot Image Rendering (Top-Weighted Matrix Adjustment)
    if (userPhoto) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, 14);
      ctx.clip();
      
      const scale = Math.max(pw / userPhoto.width, ph / userPhoto.height);
      const renderW = userPhoto.width * scale;
      const renderH = userPhoto.height * scale;
      
      const offsetX = px + (pw - renderW) / 2;
      const offsetY = py + (ph - renderH) * 0.10; 

      ctx.drawImage(userPhoto, offsetX, offsetY, renderW, renderH);
      ctx.restore();
    }

    // Border stroke for portrait box
    ctx.strokeStyle = "rgba(255, 0, 127, 0.2)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 14);
    ctx.stroke();

    // Presenter Identity Title Stack (Renders on top of purple-100 block)
    ctx.fillStyle = "#1e0030";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(name.toUpperCase() || "PRESENTER NAME", cardX + cardW / 2, cardY + 622);

    // Decorative separation rule
    ctx.fillStyle = "#1e0030";
    ctx.fillRect(cardX + cardW / 2 - 50, cardY + 632, 100, 3.5);

    // Official Conference Details Wording Blocks
    ctx.fillStyle = "#1e0030";
    ctx.font = "bold 15px Arial";
    ctx.fillText("At the 4th Ibadan International Public Health Conference", cardX + cardW / 2, cardY + 658);
    
    ctx.font = "13px Arial";
    ctx.fillStyle = "#1e0030";
    ctx.fillText("Venue: International Conference Centre, Ibadan, Nigeria", cardX + cardW / 2, cardY + 676);
    ctx.font = "bold 12px Arial";
    ctx.fillStyle = "#1e0030";
    ctx.fillText("Date: June 16 - 19, 2026", cardX + cardW / 2, cardY + 692);

    // Abstract Title Section Identifier
    ctx.fillStyle = "#1e0030";
    ctx.font = "bold 13px Arial";
    ctx.letterSpacing = "0.5px";
    ctx.fillText("TOPIC:", cardX + cardW / 2, cardY + 718);
    ctx.letterSpacing = "0px";

    // Multi-line Dynamic Content Processing Engine for Abstract Text (Forced Uppercase)
    const rawTopicText = topic ? `${topic.toUpperCase()}` : '"RESEARCH PRESENTATION ABSTRACT TITLE LAYOUT SAMPLE TEXT"';
    const words = rawTopicText.split(" ");
    const isDenseTopic = words.length > 20;
    const computedFontSize = isDenseTopic ? 15 : 17.5;
    const computedLineHeight = isDenseTopic ? 16 : 17.5 * 1.2;
    
    ctx.fillStyle = "#1e0030"; 
    ctx.font = `bold ${computedFontSize}px Arial`;
    
    let linesArray: string[] = [];
    let currentLine = "";
    const maxTextWidth = 480;

    for (let n = 0; n < words.length; n++) {
      let testLine = currentLine + words[n] + " ";
      if (ctx.measureText(testLine).width > maxTextWidth && currentLine !== "") {
        linesArray.push(currentLine.trim());
        currentLine = words[n] + " ";
      } else {
        currentLine = testLine;
      }
    }
    linesArray.push(currentLine.trim());

    // Compute dimensions for the purple border framing box around the abstract text
    const boxPaddingX = 20;
    const boxPaddingY = 12;
    const topicBoxW = maxTextWidth + (boxPaddingX * 2);
    const topicBoxH = (linesArray.length * computedLineHeight) + (boxPaddingY * 2);
    const topicBoxX = cardX + (cardW - topicBoxW) / 2;
    const topicBoxY = cardY + 728;

    // Render the Purple Border Frame around the topic text area
    ctx.strokeStyle = "#1e0030";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(topicBoxX, topicBoxY, topicBoxW, topicBoxH, 8);
    ctx.stroke();

    // Actual Text rendering inside the computed framed box boundary area coordinates
    let textStartY = topicBoxY + boxPaddingY + (computedLineHeight / 1.3);
    for (let i = 0; i < linesArray.length; i++) {
      ctx.fillText(linesArray[i], cardX + cardW / 2, textStartY);
      textStartY += computedLineHeight;
    }

    // Institutional Base Affiliation Anchor
    if (affiliation) {
      ctx.fillStyle = "#1e0030";
      ctx.font = "bold 11px Arial";
      ctx.fillText(`AFFILIATION: ${affiliation.toUpperCase()}`, cardX + cardW / 2, cardY + 836);
    }

    // =======================================================
    // RIGHT SIDE: TILTED CONFERENCE POSTER
    // =======================================================
    const posterX = 660, posterY = 20, posterW = 760, posterH = 860;
    
    ctx.save();
    ctx.translate(posterX + posterW / 2, posterY + posterH / 2);
    ctx.rotate((-1.5 * Math.PI) / 180); 
    ctx.translate(-(posterX + posterW / 2), -(posterY + posterH / 2));

    ctx.beginPath();
    ctx.roundRect(posterX, posterY, posterW, posterH, 16);
    ctx.clip();

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(posterX, posterY, posterW, posterH);

    if (posterBase) {
      const scaleX = posterW / posterBase.width;
      const scaleY = posterH / posterBase.height;
      const scale = Math.min(scaleX, scaleY); 

      const renderW = posterBase.width * scale;
      const renderH = posterBase.height * scale;

      const offsetX = posterX + (posterW - renderW) / 2;
      const offsetY = posterY + (posterH - renderH) / 2;

      ctx.drawImage(posterBase, offsetX, offsetY, renderW, renderH);
    }
    ctx.restore();

    ctx.save();
    ctx.translate(posterX + posterW / 2, posterY + posterH / 2);
    ctx.rotate((-1.5 * Math.PI) / 180);
    ctx.translate(-(posterX + posterW / 2), -(posterY + posterH / 2));
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(posterX, posterY, posterW, posterH, 16);
    ctx.stroke();
    ctx.restore();

  }, [name, affiliation, topic, presType, userPhoto, posterBase]);

  useEffect(() => { 
    if (step === "download" && isAppReady) {
      const t = setTimeout(draw, 400); 
      return () => clearTimeout(t);
    }
  }, [step, isAppReady, draw]);

  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-purple-100 flex flex-col items-center justify-center text-slate-800 font-sans p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 rounded-full border-4 border-purple-100 border-t-[#1e0030] animate-spin mx-auto" />
          <h2 className="text-sm font-bold tracking-widest text-[#1e0030] uppercase">
            4th Ibadan International Public Health Conference
          </h2>
          <p className="text-xs text-[#1e0030] font-medium tracking-wide">Welcome, Distinguished Presenter.</p>
        </div>
      </div>
    );
  }

  if (step === "generating") {
    return (
      <div className="min-h-screen bg-[#1e0030] flex flex-col items-center justify-center text-white font-sans p-4">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 rounded-full border-4 border-white/10 border-t-purple-200 animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-widest text-purple-200 animate-pulse">
            Generating your presentation flyer........
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF0F6] text-[#1e0030] flex flex-col items-center p-4 md:p-10 font-sans antialiased">
      
      {/* BRANDING APP HEADER BLOCK */}
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-sm p-5 border border-fuchsia-100 mb-8 text-center">
        <div className="flex justify-center gap-2 mb-4">
           <img src="/ui-logo.jpg" className="h-11 object-contain" alt="UI" onError={(e)=>(e.currentTarget.style.display='none')} />
           <img src="/fph-logo.jpeg" className="h-11 object-contain" alt="FPH" onError={(e)=>(e.currentTarget.style.display='none')} />
        </div>
        <h2 className="text-[#1e0030] font-bold tracking-wide uppercase text-base md:text-lg">University of Ibadan, Faculty of Public Health</h2>
        <p className="text-[#351648] font-semibold text-sm my-1 italic">presents</p>
        
        <div className="bg-[#1e0030] text-white py-4 px-6 rounded-2xl my-4 shadow-sm">
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-normal leading-tight">
            4th Ibadan International Public Health Conference 2026
          </h1>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2.5 text-xs font-bold text-slate-700">
          <span className="bg-purple-50 px-4 py-2 rounded-full border border-purple-50">June 16 - 19, 2026</span>
          <span className="bg-purple-50 px-4 py-2 rounded-full border border-purple-50">International Conference Centre, UI</span>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="h-[1px] bg-fuchsia-100 flex-1" />
          <span className="text-[#502468] text-[11px] font-extrabold uppercase tracking-widest">Generate your Presentation Flyer</span>
          <div className="h-[1px] bg-fuchsia-100 flex-1" />
        </div>
      </div>

      {step === "form" ? (
        /* INPUT CONTAINER WORKSPACE */
        <div className="w-full max-w-2xl bg-white border border-fuchsia-100 rounded-3xl p-6 md:p-8 space-y-5 shadow-sm">
          <div>
            <label className="block text-xs font-bold text-[#1e0030] uppercase mb-2 tracking-wide">Full Name *</label>
            <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Gloria Okegbemi" className="w-full bg-slate-50 border border-purple-100 rounded-xl px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4f1160] shadow-inner" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1e0030] uppercase mb-2 tracking-wide">Institutional Affiliation</label>
            <input type="text" value={affiliation} onChange={e=>setAffiliation(e.target.value)} placeholder="e.g. University of Ibadan" className="w-full bg-slate-50 border border-purple-100 rounded-xl px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4f1160]  shadow-inner" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1e0030] uppercase mb-2 tracking-wide">Presentation Category</label>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={()=>setPresType("oral")} className={`py-3.5 rounded-xl text-sm font-bold uppercase transition border ${presType === "oral" ? "bg-[#1e0030] border-[#1e0030] text-white shadow-sm" : "bg-white text-purple-900 border-purple-200 hover:bg-purple-50"}`}>
                Oral Presentation
              </button>
              <button onClick={()=>setPresType("poster")} className={`py-3.5 rounded-xl text-sm font-bold uppercase transition border ${presType === "poster" ? "bg-[#1e0030] border-[#1e0030] text-white shadow-sm" : "bg-white text-slate-700 border-purple-200 hover:bg-slate-50"}`}>
                Poster Presentation
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1e0030] uppercase mb-2 tracking-wide"> Abstract Title *</label>
            <textarea value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Enter the final title of your accepted research abstract..." rows={4} className="w-full bg-slate-50 border border-purple-100 rounded-xl px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4f1160]  shadow-inner resize-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1e0030] uppercase mb-2 tracking-wide">Your Photo</label>
            <div onClick={()=>fileInputRef.current?.click()} className="w-full h-32 rounded-xl border-2 border-dashed border-fuchsia-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-fuchsia-50/40 transition overflow-hidden">
              {photoPreview ? <img src={photoPreview} alt="Preview Snapshot" className="w-full h-full object-cover" /> : <span className="text-xs text-purple-700 font-semibold">Upload your photo</span>}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>

          <button onClick={()=>setStep("generating")} disabled={!name || !topic} className="w-full bg-[#1e0030] text-white font-bold py-4 rounded-xl transition tracking-wide text-xs uppercase mt-2 shadow-md hover:bg-[#14011F] disabled:opacity-40">
            Generate my Flyer
          </button>
        </div>
      ) : (
        /* PRESENTATION DISPLAY CANVAS VIEW */
        <div className="w-full max-w-4xl text-center space-y-6 animate-in fade-in zoom-in-98 duration-200">
          <div className="bg-white p-0.5 rounded-3xl border border-fuchsia-100 shadow-xl">
             <canvas ref={canvasRef} className="w-full h-auto rounded-2xl block mx-auto shadow-sm" />
          </div>
          <div className="flex gap-4 justify-center max-w-sm mx-auto">
             <button onClick={()=>setStep("form")} className="flex-1 bg-white hover:bg-purple-50 border border-slate-200 text-slate-700 py-3.5 rounded-xl font-bold uppercase text-xs transition">Back</button>
             <button onClick={() => {
               const canvas = canvasRef.current;
               if (!canvas) return;
               const link = document.createElement("a");
               link.download = `IIPHC2026-Presenter-${name.split(' ')[0] || 'Flyer'}.png`;
               link.href = canvas.toDataURL("image/png");
               link.click();
             }} className="flex-1 bg-[#1e0030] hover:bg-[#14011F] text-white py-3.5 px-6 rounded-xl font-black uppercase text-xs tracking-wider shadow-lg transition">Download Here</button>
          </div>
        </div>
      )}
    </main>
  );
}