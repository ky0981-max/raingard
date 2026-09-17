export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { image, mediaType } = req.body;
  if (!image || !mediaType) return res.status(400).json({ error: 'image and mediaType required' });

  const prompt = `이 이미지에서 기사단 전투 기록 데이터를 추출해주세요.
각 단원의 닉네임, 공격(판수/승/무/패/팅·미참), 방어(판수/승/무/패)를 찾아서
아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 순수 JSON 배열만:

[{"name":"닉네임","ap":0,"aw":0,"ad":0,"al":0,"at":0,"dp":0,"dw":0,"dd":0,"dl":0,"note":""}]

팅/미참 없으면 0, 방어 판수 없으면 공격 판수와 같게, 비고 없으면 빈 문자열.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mediaType, data: image } },
              { text: prompt }
            ]
          }],
          generationConfig: { temperature: 0.1 }
        })
      }
    );
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.status(200).json({ result: text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
