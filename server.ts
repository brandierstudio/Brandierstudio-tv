import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "https://fctalnchvojgqhkezope.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_wijjU8m2n4D5jYbmoTrNgA_zYemfvii";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Interface structures
interface MediaItem {
  id: string;
  type: 'video' | 'motion' | 'image';
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  videoUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
  tags: string[];
  tools: string[];
  duration?: string;
  isPremium?: boolean;
  isSpotlight?: boolean;
  isComingSoon?: boolean;
  slug: string;
  createdAt: string;
  aspectRatio?: string;
}

interface Lead {
  email: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Resilient Bidirectional Translators
function mapRowToMediaItem(row: any): MediaItem {
  const tagsParsed = Array.isArray(row.tags) 
    ? row.tags 
    : (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags || []);
  const toolsParsed = Array.isArray(row.tools) 
    ? row.tools 
    : (typeof row.tools === 'string' ? JSON.parse(row.tools) : row.tools || []);

  return {
    id: row.id,
    type: row.type || 'video',
    title: row.title || '',
    description: row.description || '',
    category: row.category || '',
    thumbnailUrl: row.thumbnailUrl || row.thumbnail_url || row.thumbnailurl || '',
    videoUrl: row.videoUrl || row.video_url || row.videourl || '',
    instagramUrl: row.instagramUrl || row.instagram_url || row.instagramurl || '',
    linkedinUrl: row.linkedinUrl || row.linkedin_url || row.linkedinurl || '',
    tiktokUrl: row.tiktokUrl || row.tiktok_url || row.tiktokurl || '',
    tags: Array.isArray(tagsParsed) ? tagsParsed : [],
    tools: Array.isArray(toolsParsed) ? toolsParsed : [],
    duration: row.duration || '',
    isPremium: row.isPremium !== undefined ? row.isPremium : (row.is_premium !== undefined ? row.is_premium : (row.ispremium !== undefined ? row.ispremium : false)),
    isSpotlight: row.isSpotlight !== undefined ? row.isSpotlight : (row.is_spotlight !== undefined ? row.is_spotlight : (row.isspotlight !== undefined ? row.isspotlight : false)),
    isComingSoon: row.isComingSoon !== undefined ? row.isComingSoon : (row.is_coming_soon !== undefined ? row.is_coming_soon : (row.iscomingsoon !== undefined ? row.iscomingsoon : false)),
    slug: row.slug || '',
    createdAt: row.createdAt || row.created_at || row.createdat || new Date().toISOString(),
    aspectRatio: row.aspectRatio || row.aspect_ratio || row.aspectratio || '16:9',
  };
}

function mapMediaItemToRow(item: MediaItem) {
  return {
    id: item.id,
    type: item.type || 'video',
    title: item.title || '',
    description: item.description || '',
    category: item.category || '',
    thumbnail_url: item.thumbnailUrl || '',
    video_url: item.videoUrl || '',
    instagram_url: item.instagramUrl || '',
    linkedin_url: item.linkedinUrl || '',
    tiktok_url: item.tiktokUrl || '',
    tags: Array.isArray(item.tags) ? item.tags : [],
    tools: Array.isArray(item.tools) ? item.tools : [],
    duration: item.duration || '',
    is_premium: !!item.isPremium,
    is_spotlight: !!item.isSpotlight,
    is_coming_soon: !!item.isComingSoon,
    slug: item.slug || '',
    created_at: item.createdAt || new Date().toISOString(),
    aspect_ratio: item.aspectRatio || '16:9',
  };
}

function mapRowToLead(row: any): Lead {
  return {
    email: row.email,
    timestamp: row.timestamp || row.created_at || row.createdat || new Date().toISOString(),
    status: (row.status || 'pending').toLowerCase() as 'pending' | 'approved' | 'rejected',
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route to read media items - fetched from permanent Supabase database
  app.get("/api/media", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      const mapped = (data || []).map(mapRowToMediaItem);
      return res.json(mapped);
    } catch (dbError: any) {
      console.error("Supabase Fetch 'videos' Failed:", dbError);
      return res.status(500).json({ error: dbError.message || String(dbError) });
    }
  });

  // API Route to save media items permanently
  app.post("/api/media", async (req, res) => {
    try {
      const mediaItems = req.body;
      if (!Array.isArray(mediaItems)) {
        return res.status(400).json({ error: "Invalid payload: must be an array of media items." });
      }

      const ids = mediaItems.map(item => item.id);
      if (ids.length > 0) {
        // Wrap with quotes to be single-quote safe inside sql "in" statement
        const escapedIdsStr = ids.map(id => `'${id.replace(/'/g, "''")}'`).join(",");
        await supabase.from("videos").delete().not("id", "in", `(${escapedIdsStr})`);
      } else {
        await supabase.from("videos").delete().neq("id", "placeholder_impossible_id");
      }

      const rows = mediaItems.map(mapMediaItemToRow);
      const { error } = await supabase.from("videos").upsert(rows);
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json({ success: true, message: "Media items saved successfully to Supabase!" });
    } catch (error: any) {
      console.error("Error saving media items:", error);
      return res.status(500).json({ error: error.message || "Failed to save media items" });
    }
  });

  // Forced Supabase CRUD operations: Asynchronous Direct `.insert()`
  app.post("/api/media/insert", async (req, res) => {
    try {
      const item = req.body;
      if (!item || !item.id) {
        return res.status(400).json({ error: "Invalid payload: must be a media item with an id." });
      }
      const row = mapMediaItemToRow(item);
      const { data, error } = await supabase
        .from("videos")
        .insert([row]);

      if (error) {
        console.error("Direct Supabase .insert() Failed:", error);
        return res.status(500).json({ error: error.message });
      }
      return res.json({ success: true, message: "Successfully inserted media item directly to live Supabase videos table!", data });
    } catch (error: any) {
      console.error("Error inserting media item:", error);
      return res.status(500).json({ error: error.message || "Failed to insert media item" });
    }
  });

  // Forced Supabase CRUD operations: Asynchronous Direct `.update()`
  app.post("/api/media/update", async (req, res) => {
    try {
      const item = req.body;
      if (!item || !item.id) {
        return res.status(400).json({ error: "Invalid payload: must be a media item with an id." });
      }
      const row = mapMediaItemToRow(item);
      const { data, error } = await supabase
        .from("videos")
        .update(row)
        .eq("id", item.id);

      if (error) {
        console.error("Direct Supabase .update() Failed:", error);
        return res.status(500).json({ error: error.message });
      }
      return res.json({ success: true, message: "Successfully updated media item directly on live Supabase videos table!", data });
    } catch (error: any) {
      console.error("Error updating media item:", error);
      return res.status(500).json({ error: error.message || "Failed to update media item" });
    }
  });

  // Forced Supabase CRUD operations: Asynchronous Direct `.delete()`
  app.post("/api/media/delete/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: "Missing media item id parameter." });
      }
      const { data, error } = await supabase
        .from("videos")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Direct Supabase .delete() Failed:", error);
        return res.status(500).json({ error: error.message });
      }
      return res.json({ success: true, message: "Successfully deleted media item directly from live Supabase videos table!", data });
    } catch (error: any) {
      console.error("Error deleting media item:", error);
      return res.status(500).json({ error: error.message || "Failed to delete media item" });
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
      let base64Content = base64Data;
      if (base64Data.includes(",")) {
        base64Content = base64Data.split(",")[1];
      }
      const dataBuffer = Buffer.from(base64Content, "base64");

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

  // API Route to read leads from Supabase directly
  app.get("/api/leads", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      const mapped = (data || []).map(mapRowToLead);
      return res.json(mapped);
    } catch (dbError: any) {
      console.error("Supabase Fetch 'leads' Failed:", dbError);
      return res.status(500).json({ error: dbError.message || String(dbError) });
    }
  });

  // API Route to save leads to Supabase directly
  app.post("/api/leads", async (req, res) => {
    try {
      const leads = req.body;
      if (!Array.isArray(leads)) {
        return res.status(400).json({ error: "Invalid payload: must be an array of leads." });
      }

      const emails = leads.map(l => l.email);
      if (emails.length > 0) {
        const formattedEmails = emails.map(m => `'${m.replace(/'/g, "''")}'`).join(",");
        await supabase.from("leads").delete().not("email", "in", `(${formattedEmails})`);
      } else {
        await supabase.from("leads").delete().neq("email", "placeholder_impossible_email");
      }

      const rows = leads.map(l => ({
        email: l.email,
        timestamp: l.timestamp || new Date().toISOString(),
        status: l.status || "pending"
      }));

      const { error } = await supabase.from("leads").upsert(rows);
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json({ success: true, message: "Leads saved successfully to Supabase!" });
    } catch (error: any) {
      console.error("Error writing leads to Supabase:", error);
      return res.status(500).json({ error: error.message || "Failed to save leads" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API to check connection status of Supabase
  app.get("/api/supabase-status", async (req, res) => {
    try {
      const videosTest = await supabase.from("videos").select("id").limit(1);
      const leadsTest = await supabase.from("leads").select("email").limit(1);
      
      const vOk = !videosTest.error;
      const lOk = !leadsTest.error;
      
      return res.json({
        supabaseUrl: SUPABASE_URL,
        videosTableOk: vOk,
        leadsTableOk: lOk,
        videosError: videosTest.error ? videosTest.error.message : null,
        leadsError: leadsTest.error ? leadsTest.error.message : null,
        allOk: vOk && lOk
      });
    } catch (err: any) {
      return res.json({
        supabaseUrl: SUPABASE_URL,
        videosTableOk: false,
        leadsTableOk: false,
        videosError: err?.message || String(err),
        leadsError: err?.message || String(err),
        allOk: false
      });
    }
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
