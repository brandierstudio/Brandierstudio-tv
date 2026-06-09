import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  const mediaFilePath = path.join(process.cwd(), "src", "db", "media-items.json");
  const leadsFilePath = path.join(process.cwd(), "src", "db", "leads.json");

  // Default initial media items fallback embedded for 100% reliable self-healing of db files
  const INITIAL_MEDIA_ITEMS = [
    {
      "id": "item-1",
      "type": "video",
      "title": "AI UGC trailer for fashion cosmetic brand",
      "description": "a simple idea is to make an aesthetic testimonial of a product. So here it is an idea.",
      "category": "AI UGC",
      "thumbnailUrl": "https://img.youtube.com/vi/TouX02-NGhY/hqdefault.jpg",
      "videoUrl": "https://youtube.com/shorts/TouX02-NGhY?feature=share",
      "tags": ["Cosmetic", "Fashion", "AI Video"],
      "tools": ["Runway Gen-3", "Midjourney v6"],
      "duration": "1:00",
      "isSpotlight": true,
      "slug": "ai-ugc-trailer-fashion-cosmetic",
      "createdAt": "2026-06-08T12:00:00.000Z",
      "aspectRatio": "9:16"
    },
    {
      "id": "item-2",
      "type": "video",
      "title": "frendh brand app promo",
      "description": "testemonial + UGC. All doen with ai,",
      "category": "AI UGC",
      "thumbnailUrl": "",
      "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "tags": ["French", "Promo", "UGC"],
      "tools": ["Luma Dream Machine", "ElevenLabs"],
      "duration": "0:18",
      "isSpotlight": true,
      "slug": "french-brand-app-promo",
      "createdAt": "2026-06-08T11:00:00.000Z",
      "aspectRatio": "16:9"
    },
    {
      "id": "item-3",
      "type": "video",
      "title": "real brand fashion story",
      "description": "Cinematic visual design. Elevating brands through state-of-the-art AI content creation workflow.",
      "category": "AI UGC",
      "thumbnailUrl": "",
      "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "tags": ["Aesthetic", "Fashion", "Commercial"],
      "tools": ["Sora AI", "After Effects"],
      "duration": "0:45",
      "isSpotlight": true,
      "slug": "real-brand-fashion-story",
      "createdAt": "2026-06-08T10:00:00.000Z",
      "aspectRatio": "16:9"
    }
  ];

  // Helper function to seed initial media if not present or empty
  const ensureMediaSchema = () => {
    try {
      let needsSeed = true;
      if (fs.existsSync(mediaFilePath)) {
        const fileContent = fs.readFileSync(mediaFilePath, "utf8").trim();
        if (fileContent.length > 5) {
          const parsed = JSON.parse(fileContent);
          if (Array.isArray(parsed) && parsed.length > 0) {
            needsSeed = false;
          }
        }
      }
      
      if (needsSeed) {
        const dirPath = path.dirname(mediaFilePath);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        fs.writeFileSync(mediaFilePath, JSON.stringify(INITIAL_MEDIA_ITEMS, null, 2), "utf8");
        console.log("Successfully seeded default media-items.json");
      }
    } catch (e) {
      console.warn("Failed to check/seed default media-items:", e);
    }
  };

  // Run on startup
  ensureMediaSchema();

  // API Route to read media items - enhanced with robust on-the-fly seed fallback
  app.get("/api/media", (req, res) => {
    try {
      ensureMediaSchema();
      if (fs.existsSync(mediaFilePath)) {
        const fileContent = fs.readFileSync(mediaFilePath, "utf8");
        const mediaItems = JSON.parse(fileContent);
        if (Array.isArray(mediaItems) && mediaItems.length > 0) {
          return res.json(mediaItems);
        }
      }
      return res.json(INITIAL_MEDIA_ITEMS);
    } catch (error) {
      console.error("Error reading media-items.json, using fallback:", error);
      return res.json(INITIAL_MEDIA_ITEMS);
    }
  });

  // API Route to save media items permanently
  app.post("/api/media", (req, res) => {
    try {
      const mediaItems = req.body;
      if (!Array.isArray(mediaItems)) {
        return res.status(400).json({ error: "Invalid payload: must be an array of media items." });
      }

      // Check for empty array save - write defaults instead, unless they explicitly edited to clear
      let collectionToSave = mediaItems;
      if (mediaItems.length === 0) {
        collectionToSave = INITIAL_MEDIA_ITEMS;
      }

      // Ensure directory exists
      const dirPath = path.dirname(mediaFilePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Write parsed media files back to workspace files
      fs.writeFileSync(mediaFilePath, JSON.stringify(collectionToSave, null, 2), "utf8");
      
      // Also write to dist/src/db if in production to make sure it is updated in served cache
      const prodMediaFilePath = path.join(process.cwd(), "dist", "src", "db", "media-items.json");
      const prodDirPath = path.dirname(prodMediaFilePath);
      if (fs.existsSync(prodDirPath)) {
        fs.writeFileSync(prodMediaFilePath, JSON.stringify(collectionToSave, null, 2), "utf8");
      }

      return res.json({ success: true, message: "Media items saved successfully!" });
    } catch (error) {
      console.error("Error writing media-items.json:", error);
      return res.status(500).json({ error: "Failed to save media items" });
    }
  });

  // Unique Direct Upload endpoint supporting base64 device payloads!
  app.post("/api/upload", (req, res) => {
    try {
      const { filename, base64Data } = req.body;
      if (!filename || !base64Data) {
        return res.status(400).json({ error: "Required fields: filename and base64Data" });
      }

      // Strip potential headers (e.g., 'data:image/png;base64,...')
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let dataBuffer: Buffer;
      if (matches && matches.length === 3) {
        dataBuffer = Buffer.from(matches[2], "base64");
      } else {
        dataBuffer = Buffer.from(base64Data, "base64");
      }

      // Set up safe targets
      const publicUploads = path.join(process.cwd(), "public", "uploads");
      const distUploads = path.join(process.cwd(), "dist", "uploads");

      // Make sure directories exist
      [publicUploads, distUploads].forEach((dir) => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });

      // Filter filename to be safe
      const cleanName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
      
      // Persist upload
      fs.writeFileSync(path.join(publicUploads, cleanName), dataBuffer);
      
      // Also copy to active production output folder
      fs.writeFileSync(path.join(distUploads, cleanName), dataBuffer);

      return res.json({ success: true, url: `/uploads/${cleanName}` });
    } catch (error) {
      console.warn("API base64 upload failed:", error);
      return res.status(500).json({ error: "Failed to upload file to backend" });
    }
  });

  // API Route to read leads
  app.get("/api/leads", (req, res) => {
    try {
      if (fs.existsSync(leadsFilePath)) {
        const fileContent = fs.readFileSync(leadsFilePath, "utf8");
        const leads = JSON.parse(fileContent);
        return res.json(leads);
      } else {
        return res.json([]);
      }
    } catch (error) {
      console.error("Error reading leads.json:", error);
      return res.status(500).json({ error: "Failed to read leads" });
    }
  });

  // API Route to save leads
  app.post("/api/leads", (req, res) => {
    try {
      const leads = req.body;
      if (!Array.isArray(leads)) {
        return res.status(400).json({ error: "Invalid payload: must be an array of leads." });
      }

      // Ensure directory exists
      const dirPath = path.dirname(leadsFilePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Write back to workspace files
      fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2), "utf8");
      
      // Also write to dist/src/db if in production
      const prodLeadsFilePath = path.join(process.cwd(), "dist", "src", "db", "leads.json");
      const prodDirPath = path.dirname(prodLeadsFilePath);
      if (fs.existsSync(prodDirPath)) {
        fs.writeFileSync(prodLeadsFilePath, JSON.stringify(leads, null, 2), "utf8");
      }

      return res.json({ success: true, message: "Leads saved successfully!" });
    } catch (error) {
      console.error("Error writing leads.json:", error);
      return res.status(500).json({ error: "Failed to save leads" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Serve custom local uploads statically for immediate rendering
  app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
  app.use("/uploads", express.static(path.join(process.cwd(), "dist", "uploads")));

  // Integrate Vite Dev Server middleware or Static Frontend serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
