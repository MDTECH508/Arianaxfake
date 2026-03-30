// api/proxy.js
// Proxy ki pèmèt ou aksede sit ki bloke depi Ayiti

export default async function handler(req, res) {
  // Mete adrès sit la isit la (sit ki nan Togo a)
  const targetSite = "https://houseofchallenge.org/"; // CHANJE ADRES SA A
  
  // Jwenn URL itilizatè a ap mande a
  let targetUrl = req.url;
  
  // Si se demann dirèk nan rasin (/)
  if (targetUrl === "/" || targetUrl === "https://houseofchallenge.org) {
    targetUrl = "";
  }
  
  // Konstwi URL konplè a
  const fullUrl = targetSite + targetUrl;
  
  try {
    // Pran tout header ki soti nan navigatè a
    const headers = { ...req.headers };
    
    // Chanje host header pou sit la panse se li menm k ap resevwa demann nan
    headers.host = new URL(targetSite).host;
    
    // Mete yon User-Agent reyisit (pou evite deteksyon)
    headers["user-agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    
    // Retire header ki ka lakòz pwoblèm
    delete headers["x-forwarded-for"];
    delete headers["x-real-ip"];
    delete headers["cf-connecting-ip"];
    delete headers["cf-ray"];
    delete headers["cf-visitor"];
    
    // Metòd HTTP (GET, POST, elatriye)
    const method = req.method;
    
    // Preparasyon pou opsyon fetch la
    const fetchOptions = {
      method: method,
      headers: headers,
    };
    
    // Si se POST, PUT, PATCH — ajoute kò a
    if (method !== "GET" && method !== "HEAD") {
      fetchOptions.body = req.body;
    }
    
    // Fè demann nan sit Togo a
    const response = await fetch(fullUrl, fetchOptions);
    
    // Prepare repons lan
    const responseHeaders = {};
    
    // Kopi header ki enpòtan yo
    const allowedHeaders = [
      "content-type",
      "content-length",
      "content-encoding",
      "cache-control",
      "expires",
      "last-modified",
      "etag"
    ];
    
    for (const header of allowedHeaders) {
      const value = response.headers.get(header);
      if (value) {
        responseHeaders[header] = value;
      }
    }
    
    // Ajoute CORS header pou pèmèt sit ou a itilize li
    responseHeaders["access-control-allow-origin"] = "*";
    responseHeaders["access-control-allow-methods"] = "GET, POST, PUT, DELETE, OPTIONS";
    responseHeaders["access-control-allow-headers"] = "*";
    
    // Jwenn kò repons lan
    const data = await response.arrayBuffer();
    
    // Voye repons lan bay itilizatè a
    res.status(response.status);
    res.set(responseHeaders);
    res.send(Buffer.from(data));
    
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({
      error: "Proxy error",
      message: error.message,
      target: fullUrl
    });
  }
}

// Sipòte OPTIONS request pou CORS
export async function OPTIONS(req, res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("access-control-allow-headers", "*");
  res.status(204).end();
}
