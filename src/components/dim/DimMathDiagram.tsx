import type { ReactNode } from "react";
import type { DimMathDiagramId } from "@/types/dim-math";
import { Sinaq10Q11CircleDiagram } from "./diagrams/sinaq-10-q11-circle";
import { Sinaq10Q19TriangleDiagram } from "./diagrams/sinaq-10-q19-triangle";

const DIAGRAMS: Record<DimMathDiagramId, () => ReactNode> = {
  "sinaq-10-q11": () => <Sinaq10Q11CircleDiagram />,
  "sinaq-10-q19": () => <Sinaq10Q19TriangleDiagram />,
};

type DimMathDiagramProps = {
  diagramId: DimMathDiagramId;
};

export function DimMathDiagram({ diagramId }: DimMathDiagramProps) {
  const Diagram = DIAGRAMS[diagramId];
  if (!Diagram) {
    return null;
  }

  return <div className="my-2">{Diagram()}</div>;
}
