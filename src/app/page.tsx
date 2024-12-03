"use client";

import React, { useState } from "react";
import PSOCanvas from "./components/PSOCanvas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const [numParticles, setNumParticles] = useState(30);
  const [inertiaWeight, setInertiaWeight] = useState(0.5);
  const [cognitiveWeight, setCognitiveWeight] = useState(2);
  const [socialWeight, setSocialWeight] = useState(2);
  const [maxVelocity, setMaxVelocity] = useState(2);
  const [maxPosition, setMaxPosition] = useState(150);
  const [reset, setReset] = useState(false);

  const handleReset = () => {
    setReset((prev) => !prev);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center p-6">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-5xl gap-8">
        {/* Configurações */}
        <Card className="w-full max-w-md shadow-lg p-4 rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Configurações do Algoritmo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="numParticles" className="text-lg">
                  Quantidade de Partículas
                </Label>
                <Input
                  type="number"
                  id="numParticles"
                  value={numParticles}
                  onChange={(e) => setNumParticles(Number(e.target.value))}
                  min="1"
                  max="100"
                  className="mt-2 p-2 text-lg"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Controla o número de partículas na simulação.
                </p>
              </div>
              <div>
                <Label htmlFor="inertiaWeight" className="text-lg">
                  Peso de Inércia
                </Label>
                <Input
                  type="number"
                  id="inertiaWeight"
                  value={inertiaWeight}
                  onChange={(e) => setInertiaWeight(Number(e.target.value))}
                  step="0.1"
                  min="0"
                  max="1"
                  className="mt-2 p-2 text-lg"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Define o quanto as partículas continuam na mesma direção.
                </p>
              </div>
              <div>
                <Label htmlFor="cognitiveWeight" className="text-lg">
                  Peso Cognitivo
                </Label>
                <Input
                  type="number"
                  id="cognitiveWeight"
                  value={cognitiveWeight}
                  onChange={(e) => setCognitiveWeight(Number(e.target.value))}
                  step="0.1"
                  min="0"
                  max="3"
                  className="mt-2 p-2 text-lg"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Controla o quanto as partículas confiam em suas próprias
                  descobertas.
                </p>
              </div>
              <div>
                <Label htmlFor="socialWeight" className="text-lg">
                  Peso Social
                </Label>
                <Input
                  type="number"
                  id="socialWeight"
                  value={socialWeight}
                  onChange={(e) => setSocialWeight(Number(e.target.value))}
                  step="0.1"
                  min="0"
                  max="3"
                  className="mt-2 p-2 text-lg"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Controla o quanto as partículas confiam no grupo.
                </p>
              </div>
              <div>
                <Label htmlFor="maxVelocity" className="text-lg">
                  Velocidade Máxima
                </Label>
                <Input
                  type="number"
                  id="maxVelocity"
                  value={maxVelocity}
                  onChange={(e) => setMaxVelocity(Number(e.target.value))}
                  step="0.1"
                  min="1"
                  max="10"
                  className="mt-2 p-2 text-lg"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Limita a velocidade das partículas.
                </p>
              </div>
              <div>
                <Label htmlFor="maxPosition" className="text-lg">
                  Área de Dispersão
                </Label>
                <Input
                  type="number"
                  id="maxPosition"
                  value={maxPosition}
                  onChange={(e) => setMaxPosition(Number(e.target.value))}
                  step="10"
                  min="50"
                  max="500"
                  className="mt-2 p-2 text-lg"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Define o espaço inicial onde as partículas se espalham.
                </p>
              </div>
              <Button
                onClick={handleReset}
                className="w-full py-3 text-xl font-semibold bg-blue-500 hover:bg-blue-600 mt-4"
              >
                Resetar Simulação
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Canvas */}
        <div className="flex-1 w-full max-w-lg mt-6 md:mt-0">
          <PSOCanvas
            numParticles={numParticles}
            inertiaWeight={inertiaWeight}
            cognitiveWeight={cognitiveWeight}
            socialWeight={socialWeight}
            maxVelocity={maxVelocity}
            maxPosition={maxPosition}
            reset={reset}
          />
        </div>
      </div>
    </div>
  );
}
