"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useRef } from "react";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const MAX_ITERATIONS = 50;

interface Point {
  x: number;
  y: number;
}

interface Particle {
  position: Point;
  velocity: Point;
  bestPosition: Point;
  bestScore: number;
  color: string;
}

const generateRandomPoint = (): Point => ({
  x: Math.random() * CANVAS_WIDTH,
  y: Math.random() * CANVAS_HEIGHT,
});

const calculateFitness = (position: Point, cities: Point[]): number => {
  let totalDistance = 0;
  cities.forEach((city) => {
    totalDistance += Math.hypot(city.x - position.x, city.y - position.y);
  });
  return totalDistance / cities.length;
};

const PSOPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);
  const [cities, setCities] = useState<Point[]>([
    { x: 200, y: 100 },
    { x: 400, y: 150 },
    { x: 300, y: 300 },
    { x: 500, y: 400 },
  ]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [globalBest, setGlobalBest] = useState<{
    position: Point;
    score: number;
  } | null>(null);
  const [iteration, setIteration] = useState(0);
  const [draggingCityIndex, setDraggingCityIndex] = useState<number | null>(
    null
  );
  const [showTrail, setShowTrail] = useState(true);

  const numParticles = 300;
  const speed = 0.07;

  useEffect(() => {
    const img = new Image();
    img.src =
      "https://maps.googleapis.com/maps/api/staticmap?center=Ipatinga,MG,Brazil&zoom=11&size=800x500&key=AIzaSyBQJAfpSgvsAl33fx5AOVvFOluEXUZ2nLc";
    img.onload = () => setMapImage(img);

    resetParticles();
  }, []);

  const resetParticles = () => {
    const initialParticles = Array.from({ length: numParticles }, () => {
      const position = generateRandomPoint();
      const fitness = calculateFitness(position, cities);
      return {
        position,
        velocity: { x: Math.random() - 0.5, y: Math.random() - 0.5 },
        bestPosition: position,
        bestScore: fitness,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      };
    });

    const bestParticle = initialParticles.reduce(
      (best, particle) =>
        particle.bestScore < best.score
          ? { position: particle.position, score: particle.bestScore }
          : best,
      { position: { x: 0, y: 0 }, score: Infinity }
    );

    setParticles(initialParticles);
    setGlobalBest(bestParticle);
    setIteration(0);
  };

  const updateParticles = () => {
    const inertia = 0.5;
    const cognitive = 2;
    const social = 2;

    setParticles((prevParticles) =>
      prevParticles.map((particle) => {
        const { position, velocity, bestPosition, bestScore } = particle;

        const score = calculateFitness(position, cities);

        let updatedBestPosition = bestPosition;
        let updatedBestScore = bestScore;
        if (score < bestScore) {
          updatedBestPosition = position;
          updatedBestScore = score;
        }

        if (!globalBest || score < globalBest.score) {
          setGlobalBest({ position, score });
        }

        const newVelocity = {
          x:
            inertia * velocity.x +
            cognitive * Math.random() * (updatedBestPosition.x - position.x) +
            social *
              Math.random() *
              (globalBest ? globalBest.position.x - position.x : 0),
          y:
            inertia * velocity.y +
            cognitive * Math.random() * (updatedBestPosition.y - position.y) +
            social *
              Math.random() *
              (globalBest ? globalBest.position.y - position.y : 0),
        };

        const newPosition = {
          x: Math.max(
            0,
            Math.min(CANVAS_WIDTH, position.x + newVelocity.x * speed)
          ),
          y: Math.max(
            0,
            Math.min(CANVAS_HEIGHT, position.y + newVelocity.y * speed)
          ),
        };

        return {
          position: newPosition,
          velocity: newVelocity,
          bestPosition: updatedBestPosition,
          bestScore: updatedBestScore,
          color: particle.color,
        };
      })
    );
  };

  useEffect(() => {
    if (iteration >= MAX_ITERATIONS) return;

    const interval = setInterval(() => {
      updateParticles();
      setIteration((prev) => prev + 1);
    }, 100);

    return () => clearInterval(interval);
  }, [iteration, particles]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !mapImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.drawImage(mapImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    cities.forEach((city) => {
      ctx.fillStyle = "blue";
      ctx.beginPath();
      ctx.arc(city.x, city.y, 10, 0, Math.PI * 2);
      ctx.fill();
    });

    particles.forEach((particle) => {
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.position.x, particle.position.y, 4, 0, Math.PI * 2);
      ctx.fill();

      if (showTrail) {
        ctx.strokeStyle = particle.color;
        ctx.beginPath();
        ctx.moveTo(particle.bestPosition.x, particle.bestPosition.y);
        ctx.lineTo(particle.position.x, particle.position.y);
        ctx.stroke();
      }
    });

    if (iteration >= MAX_ITERATIONS && globalBest) {
      ctx.fillStyle = "green";
      ctx.beginPath();
      ctx.arc(globalBest.position.x, globalBest.position.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [particles, cities, mapImage, iteration]);

  const handleMouseDown = (event: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const cityIndex = cities.findIndex(
      (city) => Math.hypot(city.x - mouseX, city.y - mouseY) < 10
    );

    if (cityIndex !== -1) {
      setDraggingCityIndex(cityIndex);
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (draggingCityIndex === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    setCities((prevCities) =>
      prevCities.map((city, index) =>
        index === draggingCityIndex ? { x: mouseX, y: mouseY } : city
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingCityIndex(null);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-gray-50 min-h-screen">
      <Card className="max-w-2xl w-full shadow-lg border border-gray-200">
        <div className="p-6">
          <h1 className="text-3xl font-semibold text-center text-gray-800 mb-4">
            PSO - Melhor Local para um Posto de Gasolina
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed">
            <strong>Iteração Atual:</strong> {iteration}
            <br />
            {/* <strong>Melhor Pontuação:</strong>{" "}
            {globalBest ? globalBest.score.toFixed(2) : "Calculando..."} */}
          </p>
        </div>
      </Card>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border rounded-lg shadow-lg cursor-pointer bg-white"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>

      <div className="flex items-center gap-4">
        <Checkbox
          checked={showTrail}
          onCheckedChange={() => setShowTrail((prev) => !prev)}
        />
        <label className="text-gray-700">Exibir Rastro das Partículas</label>
      </div>

      <Button className="mt-4" onClick={resetParticles}>
        Reiniciar Simulação
      </Button>
    </div>
  );
};

export default PSOPage;
