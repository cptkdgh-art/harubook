import { ImageResponse } from 'next/og';

export const alt = '하루책 — AI 파트너와 함께 쓰는 투두';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(135deg, #fff8f4 0%, #fde7e7 48%, #f7d8df 100%)',
          color: '#10162f',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 460,
            height: 460,
            borderRadius: 999,
            background: 'rgba(255,255,255,.52)',
            top: -150,
            left: -90,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: 999,
            background: 'rgba(255,177,190,.20)',
            right: -80,
            bottom: -160,
          }}
        />

        <div
          style={{
            width: '56%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '70px 0 70px 82px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <div
              style={{
                width: 94,
                height: 94,
                borderRadius: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8ccd1',
                fontSize: 52,
              }}
            >
              📖
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 84,
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: '-4px',
              }}
            >
              하루책
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 36,
              fontSize: 43,
              fontWeight: 700,
              letterSpacing: '-2px',
            }}
          >
            AI 파트너와 함께 쓰는 투두
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 23,
              width: 570,
              fontSize: 27,
              lineHeight: 1.45,
              color: '#43475a',
              letterSpacing: '-1px',
            }}
          >
            일상을 기록하면, AI가 한 주의 이야기를 엮어줘요
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 38,
              padding: '13px 20px',
              borderRadius: 999,
              background: 'rgba(255,255,255,.72)',
              border: '1px solid rgba(16,22,47,.08)',
              width: 300,
              fontSize: 19,
              color: '#5f5360',
            }}
          >
            하루의 할 일 → 한 편의 이야기 ✨
          </div>
        </div>

        <div
          style={{
            width: '44%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingRight: 50,
          }}
        >
          <div
            style={{
              width: 385,
              height: 525,
              borderRadius: 52,
              padding: 14,
              background: '#171820',
              boxShadow: '0 28px 60px rgba(58,35,47,.23)',
              transform: 'rotate(3deg)',
              display: 'flex',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 40,
                background: '#fffaf8',
                display: 'flex',
                flexDirection: 'column',
                padding: '30px 27px',
              }}
            >
              <div style={{ display: 'flex', fontSize: 31, fontWeight: 800 }}>
                📖 하루책
              </div>
              <div
                style={{
                  display: 'flex',
                  marginTop: 28,
                  padding: '20px 18px',
                  borderRadius: 18,
                  background: '#ffffff',
                  fontSize: 19,
                  color: '#555b69',
                }}
              >
                ✎ 오늘은 어떤 하루였나요?
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginTop: 22,
                  padding: '22px 20px',
                  borderRadius: 20,
                  background: '#fff',
                }}
              >
                <div style={{ display: 'flex', fontSize: 20, fontWeight: 700 }}>
                  오늘의 할 일
                </div>
                <div style={{ display: 'flex', marginTop: 18, fontSize: 18 }}>
                  ✅ 운동하기
                </div>
                <div style={{ display: 'flex', marginTop: 13, fontSize: 18 }}>
                  ○ 책 30분 읽기
                </div>
                <div style={{ display: 'flex', marginTop: 13, fontSize: 18 }}>
                  ○ 친구에게 안부 묻기
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginTop: 20,
                  padding: '22px 20px',
                  borderRadius: 20,
                  background:
                    'linear-gradient(135deg, #fff0f2 0%, #f7eafa 100%)',
                }}
              >
                <div style={{ display: 'flex', fontSize: 19, fontWeight: 700 }}>
                  AI가 엮은 이번 주 이야기 ✨
                </div>
                <div
                  style={{
                    display: 'flex',
                    marginTop: 12,
                    fontSize: 16,
                    lineHeight: 1.45,
                    color: '#5a5666',
                  }}
                >
                  작은 노력들이 모여 조금 더 나은 나의 한 주가 되었어요.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            right: 62,
            top: 40,
            display: 'flex',
            fontSize: 28,
            color: '#e88798',
          }}
        >
          ✦
        </div>
        <div
          style={{
            position: 'absolute',
            right: 500,
            bottom: 55,
            display: 'flex',
            fontSize: 23,
            color: '#ef9daa',
          }}
        >
          ✦
        </div>
      </div>
    ),
    size
  );
}
