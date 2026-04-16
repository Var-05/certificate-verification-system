import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const EMPLOYEES_FILE = path.join(process.cwd(), "employees.json");
  const CERTIFICATES_FILE = path.join(process.cwd(), "certificates.json");
  const FRESHERS_FILE = path.join(process.cwd(), "freshers.json");

  // API Routes
  app.post("/api/registerFresher", (req, res) => {
    const fresherData = req.body;
    const id = "FRESH-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newFresher = { ...fresherData, id, registeredAt: new Date().toISOString() };
    
    try {
      const data = JSON.parse(fs.readFileSync(FRESHERS_FILE, "utf-8"));
      data.push(newFresher);
      fs.writeFileSync(FRESHERS_FILE, JSON.stringify(data, null, 2));
      res.json({ success: true, id, message: "Registration successful" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.get("/api/fresher/:id", (req, res) => {
    const { id } = req.params;
    try {
      const data = JSON.parse(fs.readFileSync(FRESHERS_FILE, "utf-8"));
      const fresher = data.find((f: any) => f.id === id);
      if (fresher) {
        res.json({ success: true, fresher });
      } else {
        res.json({ success: false, message: "Profile not found" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.post("/api/issueCertificate", (req, res) => {
    const { hash, studentName, degree, issuer } = req.body;
    try {
      const data = JSON.parse(fs.readFileSync(CERTIFICATES_FILE, "utf-8"));
      if (data.some((c: any) => c.hash === hash)) {
        return res.json({ success: false, message: "Certificate already issued" });
      }
      data.push({ 
        hash, 
        studentName, 
        degree, 
        issuer, 
        timestamp: new Date().toISOString() 
      });
      fs.writeFileSync(CERTIFICATES_FILE, JSON.stringify(data, null, 2));
      res.json({ success: true, message: "Certificate issued successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.post("/api/verifyCertificate", (req, res) => {
    const { hash } = req.body;
    try {
      const data = JSON.parse(fs.readFileSync(CERTIFICATES_FILE, "utf-8"));
      const certificate = data.find((c: any) => c.hash === hash);
      res.json({ success: true, isGenuine: !!certificate, certificate });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.post("/api/verifyEmployee", (req, res) => {
    const { employeeId } = req.body;
    try {
      const data = JSON.parse(fs.readFileSync(EMPLOYEES_FILE, "utf-8"));
      const employee = data.find((e: any) => e.employeeId === employeeId || e.pfNumber === employeeId);
      if (employee) {
        res.json({ success: true, employee });
      } else {
        res.json({ success: false, message: "Employee ID not found" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
