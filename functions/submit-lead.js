export async function onRequestPost(context) {
    try {
        const { name, email, phone, location, service, propertyType, budget, timeline, message } = await context.request.json();
        
        const GOOGLE_WEB_APP_URL = context.env.GOOGLE_WEB_APP_URL;
        const SECRET_PASSWORD = context.env.SECRET_PASSWORD; 

        const payload = {
            name: name || '',
            email: email || '',
            phone: phone || '',
            location: location || '',
            service: service || '',
            propertyType: propertyType || '',
            budget: budget || '',
            timeline: timeline || '',
            message: message || '',
            token: SECRET_PASSWORD
        };

        // Forward the data to Google Sheets
        const googleResponse = await fetch(GOOGLE_WEB_APP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // FIX: Extract the raw text response safely instead of parsing strict JSON
        const rawText = await googleResponse.text();

        // Safe evaluation response fallback
        let responseData = { result: "success" };
        try {
            responseData = JSON.parse(rawText);
        } catch(e) {
            // Google often successfully processes the sheet update but returns plain text or HTML
            if (rawText.includes("success") || googleResponse.ok) {
                responseData = { result: "success" };
            } else {
                responseData = { result: "error", message: "Google Sheet communication error" };
            }
        }

        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            }
        });

    } catch (err) {
        return new Response(JSON.stringify({ result: "error", message: err.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
