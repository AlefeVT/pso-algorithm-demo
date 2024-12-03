"use client";

import React, { useRef, useEffect, useState } from "react";

// Interface representando uma partícula na simulação
interface Particle {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  bestPosition: { x: number; y: number };
  bestObjectiveValue: number;
  updateParticle: (
    globalBestPosition: { x: number; y: number },
    inertiaFactor: number
  ) => void;
  render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
}

// Props recebidas pelo componente PSOCanvas
interface PSOCanvasProps {
  numParticles: number;
  inertiaWeight: number;
  cognitiveWeight: number;
  socialWeight: number;
  maxVelocity: number;
  maxPosition: number;
  reset: boolean; // Controla o reset da simulação
}

const PSOCanvas: React.FC<PSOCanvasProps> = ({
  numParticles,
  inertiaWeight,
  cognitiveWeight,
  socialWeight,
  maxVelocity,
  maxPosition,
  reset,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [globalBestPosition, setGlobalBestPosition] = useState({ x: 0, y: 0 });
  const [globalBestObjectiveValue, setGlobalBestObjectiveValue] =
    useState<number>(Infinity);

  /**
   * Função objetivo: Calcula o valor de desempenho de uma partícula.
   * Neste caso, usamos a função Rastrigin, que é comum em testes de otimização.
   */
  const calculateObjectiveValue = (x: number, y: number): number => {
    return (
      10 * 2 +
      (x * x - 10 * Math.cos(2 * Math.PI * x)) +
      (y * y - 10 * Math.cos(2 * Math.PI * y))
    );
  };

  /**
   * Classe representando uma partícula.
   * Cada partícula mantém sua posição, velocidade, melhor posição encontrada e valor objetivo.
   */
  class ParticleImplementation implements Particle {
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    bestPosition: { x: number; y: number };
    bestObjectiveValue: number;

    constructor(initialX: number, initialY: number) {
      this.position = { x: initialX, y: initialY };
      this.velocity = {
        x: Math.random() * maxVelocity * 2 - maxVelocity,
        y: Math.random() * maxVelocity * 2 - maxVelocity,
      };
      this.bestPosition = { ...this.position };
      this.bestObjectiveValue = calculateObjectiveValue(initialX, initialY);
    }

    /**
     * Atualiza a posição e velocidade da partícula com base nos fatores de inércia, cognição e social.
     */
    updateParticle(
      globalBestPosition: { x: number; y: number },
      inertiaFactor: number
    ) {
      const randomCognitive = Math.random();
      const randomSocial = Math.random();

      // Atualiza a velocidade com base nos fatores
      this.velocity.x =
        inertiaFactor * this.velocity.x +
        cognitiveWeight *
          randomCognitive *
          (this.bestPosition.x - this.position.x) +
        socialWeight * randomSocial * (globalBestPosition.x - this.position.x);

      this.velocity.y =
        inertiaFactor * this.velocity.y +
        cognitiveWeight *
          randomCognitive *
          (this.bestPosition.y - this.position.y) +
        socialWeight * randomSocial * (globalBestPosition.y - this.position.y);

      // Garante que a velocidade esteja dentro dos limites
      this.velocity.x = Math.max(
        -maxVelocity,
        Math.min(maxVelocity, this.velocity.x)
      );
      this.velocity.y = Math.max(
        -maxVelocity,
        Math.min(maxVelocity, this.velocity.y)
      );

      // Atualiza a posição da partícula
      this.position.x = Math.max(
        -maxPosition,
        Math.min(maxPosition, this.position.x + this.velocity.x)
      );
      this.position.y = Math.max(
        -maxPosition,
        Math.min(maxPosition, this.position.y + this.velocity.y)
      );

      // Calcula o valor objetivo para a nova posição
      const currentObjectiveValue = calculateObjectiveValue(
        this.position.x,
        this.position.y
      );

      // Atualiza a melhor posição e valor da partícula, se necessário
      if (currentObjectiveValue < this.bestObjectiveValue) {
        this.bestObjectiveValue = currentObjectiveValue;
        this.bestPosition = { ...this.position };
      }
    }

    /**
     * Renderiza a partícula no canvas.
     */
    render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
      ctx.beginPath();
      ctx.arc(
        this.position.x + canvas.width / 2,
        -this.position.y + canvas.height / 2,
        5,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "blue";
      ctx.fill();
      ctx.closePath();
    }
  }

  /**
   * Inicializa as partículas, atribuindo posições e velocidades iniciais aleatórias.
   */
  const initializeParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newParticles: Particle[] = [];
    let bestValueFound = Infinity;
    let bestPositionFound = { x: 0, y: 0 };

    for (let i = 0; i < numParticles; i++) {
      const initialX = Math.random() * maxPosition * 2 - maxPosition;
      const initialY = Math.random() * maxPosition * 2 - maxPosition;

      const particle = new ParticleImplementation(initialX, initialY);
      newParticles.push(particle);

      // Atualiza a melhor posição global, se necessário
      if (particle.bestObjectiveValue < bestValueFound) {
        bestValueFound = particle.bestObjectiveValue;
        bestPositionFound = { ...particle.bestPosition };
      }
    }

    setParticles(newParticles);
    setGlobalBestObjectiveValue(bestValueFound);
    setGlobalBestPosition(bestPositionFound);
  };

  /**
   * Função que executa a animação contínua da simulação.
   */
  const animateParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calcula o fator de inércia dinâmico (diminui com o tempo)
    const inertiaFactor = Math.max(0.4, inertiaWeight * 0.99);

    // Renderiza a posição global ótima
    ctx.beginPath();
    ctx.arc(
      globalBestPosition.x + canvas.width / 2,
      -globalBestPosition.y + canvas.height / 2,
      8,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();

    // Atualiza e renderiza cada partícula
    particles.forEach((particle) => {
      particle.updateParticle(globalBestPosition, inertiaFactor);

      if (particle.bestObjectiveValue < globalBestObjectiveValue) {
        setGlobalBestObjectiveValue(particle.bestObjectiveValue);
        setGlobalBestPosition({ ...particle.bestPosition });
      }

      particle.render(ctx, canvas);
    });

    requestAnimationFrame(animateParticles);
  };

  // Inicializa as partículas quando os parâmetros mudam
  useEffect(() => {
    initializeParticles();
  }, [
    numParticles,
    inertiaWeight,
    cognitiveWeight,
    socialWeight,
    maxVelocity,
    maxPosition,
  ]);

  // Reinicia as partículas quando o reset for ativado
  useEffect(() => {
    if (reset) initializeParticles();
  }, [reset]);

  // Inicia a animação
  useEffect(() => {
    animateParticles();
  }, [particles]);

  return (
    <div id="canvas-container" className="border-2 border-gray-700 rounded-lg">
      <canvas
        ref={canvasRef}
        className="bg-white"
        width={600}
        height={400}
      ></canvas>
    </div>
  );
};

export default PSOCanvas;
