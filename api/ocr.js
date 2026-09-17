export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { image, mediaType } = req.body;
  if (!image || !mediaType) return res.status(400).json({ error: 'image and mediaType required' });

  const prompt = `이 이미지는 에픽세븐 게임의 기사단 전투 현황 화면입니다.
각 단원의 닉네임과 전투 기록(승리/무승부/패배 숫자)을 추출해주세요.

규칙:
- 닉네임은 한글/영문/숫자/특수문자 포함 가능
- "N 승리" → aw(공격 승), "N 무승부" → ad(공격 무), "N 패배" → al(공격 패)
- 판수(ap)는 승+무+패를 3으로 나눈 값 (소수점 올림)
- 방어 데이터가 없으면 dp/dw/dd/dl 모두 0
- 반드시 JSON 배열만 반환, 다른 텍스트 없이

형식:
[{"name":"닉네임","ap":1,"aw":3,"ad":0,"al":0,"at":0,"dp":0,"dw":0,"dd":0,"dl":0,"note":""}]`;

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
          generationConfig: {
            temperature: 0,
            response_mime_type: 'application/json'
          }
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
