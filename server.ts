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

  // API Route to read media items - fetched from permanent Supabase database
  app.get("/api/media", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data && Array.isArray(data)) {
        const mapped = data.map(mapRowToMediaItem);
        // Save locally as Cache fallback
        try {
          fs.writeFileSync(mediaFilePath, JSON.stringify(mapped, null, 2), "utf8");
        } catch (e) {
          console.warn("Could not save media cache file:", e);
        }
        return res.json(mapped);
      }
      
      throw new Error("No data returned from videos table");
    } catch (dbError: any) {
      console.warn("Supabase Fetch 'videos' Failed (Possibly table is not created yet). Using local JSON cache fallback:", dbError.message || dbError);
      
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
        console.error("Error reading fallback media-items.json:", error);
        return res.json(INITIAL_MEDIA_ITEMS);
      }
    }
  });

  // API Route to save media items permanently
  app.post("/api/media", async (req, res) => {
    try {
      const mediaItems = req.body;
      if (!Array.isArray(mediaItems)) {
        return res.status(400).json({ error: "Invalid payload: must be an array of media items." });
      }

      let collectionToSave = mediaItems;
      if (mediaItems.length === 0) {
        collectionToSave = INITIAL_MEDIA_ITEMS;
      }

      // 1. Persist to Supabase if possible
      try {
        const ids = collectionToSave.map(item => item.id);
        if (ids.length > 0) {
          // Wrap with quotes to be single-quote safe inside sql "in" statement
          const escapedIdsStr = ids.map(id => `'${id.replace(/'/g, "''")}'`).join(",");
          await supabase.from("videos").delete().not("id", "in", `(${escapedIdsStr})`);
        } else {
          await supabase.from("videos").delete().neq("id", "placeholder_impossible_id");
        }

        const rows = collectionToSave.map(mapMediaItemToRow);
        const { error } = await supabase.from("videos").upsert(rows);
        if (error) throw error;
        console.log("Successfully synchronized media items to Supabase videos table");
      } catch (dbError: any) {
        console.warn("Could not save to Supabase 'videos' table, falling back to local files:", dbError.message || dbError);
      }

      // 2. Persist to local cache
      const dirPath = path.dirname(mediaFilePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(mediaFilePath, JSON.stringify(collectionToSave, null, 2), "utf8");
      
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
  app.get("/api/leads", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) {
        throw error;
      }

      if (data && Array.isArray(data)) {
        const mapped = data.map(mapRowToLead);
        try {
          fs.writeFileSync(leadsFilePath, JSON.stringify(mapped, null, 2), "utf8");
        } catch (e) {
          console.warn("Could not save leads cache file:", e);
        }
        return res.json(mapped);
      }
      throw new Error("No data returned from leads table");
    } catch (dbError: any) {
      console.warn("Supabase Fetch 'leads' Failed. Using local JSON cache fallback:", dbError.message || dbError);
      try {
        if (fs.existsSync(leadsFilePath)) {
          const fileContent = fs.readFileSync(leadsFilePath, "utf8");
          const leads = JSON.parse(fileContent);
          return res.json(leads);
        }
        return res.json([]);
      } catch (error) {
        console.error("Error reading leads.json:", error);
        return res.json([]);
      }
    }
  });

  // API Route to save leads
  app.post("/api/leads", async (req, res) => {
    try {
      const leads = req.body;
      if (!Array.isArray(leads)) {
        return res.status(400).json({ error: "Invalid payload: must be an array of leads." });
      }

      // 1. Sync list to Supabase if possible
      try {
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
        if (error) throw error;
        console.log("Successfully synchronized leads to Supabase leads table");
      } catch (dbError: any) {
        console.warn("Could not save to Supabase 'leads' table, falling back to local files:", dbError.message || dbError);
      }

      // 2. Sync to local JSON
      const dirPath = path.dirname(leadsFilePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2), "utf8");
      
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
