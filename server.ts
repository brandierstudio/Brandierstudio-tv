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

  // API Route to read media items
  app.get("/api/media", (req, res) => {
    try {
      if (fs.existsSync(mediaFilePath)) {
        const fileContent = fs.readFileSync(mediaFilePath, "utf8");
        const mediaItems = JSON.parse(fileContent);
        return res.json(mediaItems);
      } else {
        return res.json([]);
      }
    } catch (error) {
      console.error("Error reading media-items.json:", error);
      return res.status(500).json({ error: "Failed to read media items" });
    }
  });

  // API Route to save media items permanently
  app.post("/api/media", (req, res) => {
    try {
      const mediaItems = req.body;
      if (!Array.isArray(mediaItems)) {
        return res.status(400).json({ error: "Invalid payload: must be an array of media items." });
      }

      // Ensure directory exists
      const dirPath = path.dirname(mediaFilePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Write parsed media files back to workspace files
      fs.writeFileSync(mediaFilePath, JSON.stringify(mediaItems, null, 2), "utf8");
      
      // Also write to dist/src/db if in production to make sure it is updated in served cache
      const prodMediaFilePath = path.join(process.cwd(), "dist", "src", "db", "media-items.json");
      const prodDirPath = path.dirname(prodMediaFilePath);
      if (fs.existsSync(prodDirPath)) {
        fs.writeFileSync(prodMediaFilePath, JSON.stringify(mediaItems, null, 2), "utf8");
      }

      return res.json({ success: true, message: "Media items saved successfully!" });
    } catch (error) {
      console.error("Error writing media-items.json:", error);
      return res.status(500).json({ error: "Failed to save media items" });
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
