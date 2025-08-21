import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function ErrorPage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const c = canvasRef.current;
    let w = (c.width = window.innerWidth);
    let h = (c.height = window.innerHeight);
    const ctx = c.getContext("2d");
    let hw = w / 2,
      hh = h / 2.5;

    const isMobile = window.innerWidth < 768;

    const opts = {
      strings: ["ERROR PAGE","NOT FOUND","404"],
      charSize: isMobile ? 20 : 30,
      charSpacing: isMobile ? 25 : 35,
      lineHeight: isMobile ? 30 : 40,
      cx: w / 2,
      cy: h / 2.5,
      fireworkPrevPoints: 10,
      fireworkBaseLineWidth: 5,
      fireworkAddedLineWidth: 8,
      fireworkSpawnTime: 200,
      fireworkBaseReachTime: 30,
      fireworkAddedReachTime: 30,
      fireworkCircleBaseSize: 20,
      fireworkCircleAddedSize: 10,
      fireworkCircleBaseTime: 30,
      fireworkCircleAddedTime: 30,
      fireworkCircleFadeBaseTime: 10,
      fireworkCircleFadeAddedTime: 5,
      fireworkBaseShards: 5,
      fireworkAddedShards: 5,
      fireworkShardPrevPoints: 3,
      fireworkShardBaseVel: 4,
      fireworkShardAddedVel: 2,
      fireworkShardBaseSize: 3,
      fireworkShardAddedSize: 3,
      gravity: 0.1,
      upFlow: -0.1,
      letterContemplatingWaitTime: 360,
      balloonSpawnTime: 20,
      balloonBaseInflateTime: 10,
      balloonAddedInflateTime: 10,
      balloonBaseSize: 20,
      balloonAddedSize: 20,
      balloonBaseVel: 0.4,
      balloonAddedVel: 0.4,
      balloonBaseRadian: -(Math.PI / 2 - 0.5),
      balloonAddedRadian: -1,
    };

    const Tau = Math.PI * 2;
    const TauQuarter = Tau / 4;
    const letters = [];

    ctx.font = opts.charSize + "px Verdana";

    function Letter(char, x, y) {
      this.char = char;
      this.x = x;
      this.y = y;

      this.dx = -ctx.measureText(char).width / 2;
      this.dy = +opts.charSize / 2;
      this.fireworkDy = this.y - hh;

      const hue = (x / (opts.charSpacing * Math.max(opts.strings[0].length, opts.strings[1].length))) * 360;
      this.color = `hsl(${hue},80%,50%)`;
      this.lightColor = `hsl(${hue},80%,70%)`;
      this.alphaColor = `hsla(${hue},80%,50%,alp)`;

      this.reset();
    }

    Letter.prototype.reset = function () {
      this.phase = "firework";
      this.tick = 0;
      this.spawned = false;
      this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
      this.reachTime = (opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random()) | 0;
      this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
      this.prevPoints = [[0, hh, 0]];
    };

    Letter.prototype.step = function () {
      if (this.phase === "firework") {
        if (!this.spawned) {
          ++this.tick;
          if (this.tick >= this.spawningTime) {
            this.tick = 0;
            this.spawned = true;
          }
        } else {
          ++this.tick;
          const linearProportion = this.tick / this.reachTime;
          const armonicProportion = Math.sin(linearProportion * TauQuarter);
          const x = linearProportion * this.x;
          const y = hh + armonicProportion * this.fireworkDy;

          if (this.prevPoints.length > opts.fireworkPrevPoints) this.prevPoints.shift();
          this.prevPoints.push([x, y, linearProportion * this.lineWidth]);

          for (let i = 1; i < this.prevPoints.length; ++i) {
            const point = this.prevPoints[i];
            const point2 = this.prevPoints[i - 1];
            ctx.strokeStyle = this.alphaColor.replace("alp", i / this.prevPoints.length);
            ctx.lineWidth = (point[2] / (this.prevPoints.length - 1)) * i;
            ctx.beginPath();
            ctx.moveTo(point[0], point[1]);
            ctx.lineTo(point2[0], point2[1]);
            ctx.stroke();
          }

          if (this.tick >= this.reachTime) this.phase = "done";
        }
      } else {
        ctx.fillStyle = this.lightColor;
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
      }
    };

    for (let i = 0; i < opts.strings.length; ++i) {
      for (let j = 0; j < opts.strings[i].length; ++j) {
        letters.push(
          new Letter(
            opts.strings[i][j],
            j * opts.charSpacing - (opts.strings[i].length * opts.charSize) / 2,
            i * opts.lineHeight
          )
        );
      }
    }

    function anim() {
      requestAnimationFrame(anim);
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(hw, hh);
      for (const l of letters) l.step();
      ctx.restore();
    }

    anim();

    window.addEventListener("resize", () => {
      w = c.width = window.innerWidth;
      h = c.height = window.innerHeight;
      hw = w / 2;
      hh = h / 2.5;
      ctx.font = opts.charSize + "px Verdana";
    });
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white dark:bg-black">
      {/* Canvas Animation */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Overlay Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        <div className="mt-60 sm:mt-72 flex flex-row flex-wrap justify-center gap-3 w-full max-w-xs sm:max-w-md">
  <Link
    to="/login"
    className="px-4 py-2 sm:px-5 sm:py-2 rounded-full text-sm sm:text-base font-semibold text-white 
    bg-gradient-to-r from-pink-500 to-purple-500 hover:scale-105 transform transition shadow-md"
  >
    Go to Login
  </Link>

</div>

      </div>
    </div>
  );
}
