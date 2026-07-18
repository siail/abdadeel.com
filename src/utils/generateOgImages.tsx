import satori, { type SatoriOptions } from "satori";
import { Resvg } from "@resvg/resvg-js";
import { type CollectionEntry } from "astro:content";
import { readFile } from "node:fs/promises";
import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";

const fetchFonts = async () => {
  const fontRegularBuffer = await readFile(
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
  );
  const fontBoldBuffer = await readFile(
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
  );

  const fontRegular = fontRegularBuffer.buffer.slice(
    fontRegularBuffer.byteOffset,
    fontRegularBuffer.byteOffset + fontRegularBuffer.byteLength
  );
  const fontBold = fontBoldBuffer.buffer.slice(
    fontBoldBuffer.byteOffset,
    fontBoldBuffer.byteOffset + fontBoldBuffer.byteLength
  );

  return { fontRegular, fontBold };
};

const { fontRegular, fontBold } = await fetchFonts();

const options: SatoriOptions = {
  width: 1200,
  height: 630,
  embedFont: true,
  fonts: [
    {
      name: "Poppins",
      data: fontRegular,
      weight: 400,
      style: "normal",
    },
    {
      name: "Poppins",
      data: fontBold,
      weight: 600,
      style: "normal",
    },
  ],
};

function svgBufferToPngBuffer(svg: string) {
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}

export async function generateOgImageForPost(post: CollectionEntry<"blog">) {
  const svg = await satori(postOgImage(post), options);
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForSite() {
  const svg = await satori(siteOgImage(), options);
  return svgBufferToPngBuffer(svg);
}
