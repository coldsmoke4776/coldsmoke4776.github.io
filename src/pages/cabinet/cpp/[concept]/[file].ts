import type { APIRoute } from "astro";
import fs from "node:fs";
import { cppCabinetRoot, cppConceptDirectory } from "@/lib/technicalCabinet";

export function getStaticPaths() {
  const conceptsRoot = `${cppCabinetRoot}/concepts`;

  return fs
    .readdirSync(conceptsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) =>
      fs
        .readdirSync(cppConceptDirectory(entry.name), { withFileTypes: true })
        .filter((file) => file.isFile() && /\.(?:c|cpp|h|txt)$/.test(file.name))
        .map((file) => ({
          params: { concept: entry.name, file: file.name },
          props: {
            sourcePath: `${cppConceptDirectory(entry.name)}/${file.name}`,
          },
        })),
    );
}

export const GET: APIRoute = ({ props }) => {
  const source = fs.readFileSync(props.sourcePath, "utf8");

  return new Response(source, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
