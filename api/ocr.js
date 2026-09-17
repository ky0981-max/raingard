export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { image, mediaType } = req.body;
  if (!image || !mediaType) return res.status(400).json({ error: 'image and mediaType required' });

  const prompt = `이 이미지는 에픽세븐 게임의 기사단 전투 현황 화면입니다.
각 단원의 닉네임과 전투 기록을 추출해서 JSON 배열로만 응답하세요.

- 닉네임: 캐릭터 이름 아래 표시된 텍스트
- "N 승리" → aw, "N 무승부" → ad, "N 패배" → al
- ap = 승+무+패를 3으로 나눈 값 (올림)
- 방어 데이터 없으면 dp/dw/dd/dl = 0

반드시 아래 형식의 JSON 배열만 반환 (마크다운 없이):
[{"name":"닉네임","ap":1,"aw":3,"ad":0,"al":0,"at":0,"dp":0,"dw":0,"dd":0,"dl":0,"note":""}]`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
          generationConfig: { temperature: 0 }
        })
      }
    );
    const data = await response.json();
    console.log('Gemini raw:', JSON.stringify(data).slice(0, 500));
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.status(200).json({ result: text });
  } catch (e) {
    console.error('Error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
