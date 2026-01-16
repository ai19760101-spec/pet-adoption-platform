-- =============================================
-- 寵物領養平台 Supabase 數據庫初始化腳本
-- =============================================
-- 請在 Supabase SQL Editor 中執行此腳本

-- 1. 用戶表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    member_since DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 寵物表
CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    age VARCHAR(50) NOT NULL,
    age_group VARCHAR(20) NOT NULL CHECK (age_group IN ('幼年', '成年', '老年')),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('公', '母')),
    size VARCHAR(10) NOT NULL CHECK (size IN ('小型', '中型', '大型')),
    pet_type VARCHAR(20) NOT NULL CHECK (pet_type IN ('狗狗', '貓咪', '鳥類', '兔子', '其他')),
    location VARCHAR(100) NOT NULL,
    distance VARCHAR(50),
    image_url TEXT NOT NULL,
    description TEXT,
    adoption_fee DECIMAL(10, 2) DEFAULT 0,
    is_vaccinated BOOLEAN DEFAULT FALSE,
    is_neutered BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, pet_id)
);

-- 4. 領養申請表
CREATE TABLE IF NOT EXISTS adoption_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'interview', 'completed', 'rejected')),
    housing_type VARCHAR(50),
    outdoor_space VARCHAR(50),
    is_renting BOOLEAN DEFAULT FALSE,
    has_pets BOOLEAN DEFAULT FALSE,
    experience TEXT,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    interview_date DATE,
    interview_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 用戶刊登的寵物表
CREATE TABLE IF NOT EXISTS pet_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    pet_type VARCHAR(20) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    age VARCHAR(50) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    size VARCHAR(10),
    description TEXT,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'adopted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 訊息對話表
CREATE TABLE IF NOT EXISTS message_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shelter_name VARCHAR(100) NOT NULL,
    shelter_avatar TEXT,
    pet_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 訊息表
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'other')),
    text TEXT,
    image_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 幸福故事表
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author VARCHAR(100) NOT NULL,
    pet_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 創建索引以提升查詢效能
-- =============================================
CREATE INDEX IF NOT EXISTS idx_pets_location ON pets(location);
CREATE INDEX IF NOT EXISTS idx_pets_type ON pets(pet_type);
CREATE INDEX IF NOT EXISTS idx_pets_age_group ON pets(age_group);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON adoption_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);

-- =============================================
-- 插入測試用戶
-- =============================================
INSERT INTO users (id, name, email, avatar_url, member_since)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Alex',
    'alex@example.com',
    'https://picsum.photos/seed/alex/300/300',
    '2023-01-01'
) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 插入示範寵物數據
-- =============================================
INSERT INTO pets (name, breed, age, age_group, gender, size, pet_type, location, distance, image_url, description, adoption_fee, is_vaccinated, is_neutered, is_featured, tags)
VALUES 
(
    'Bella',
    '黃金獵犬',
    '2 歲',
    '成年',
    '母',
    '大型',
    '狗狗',
    '台北市',
    '2.5 公里外',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800',
    'Bella 是一隻熱愛陽光的狗狗，喜歡在海灘散步和追網球。牠非常親人，儘管體型不小，但總以為自己是隻膝上狗。',
    150,
    TRUE,
    TRUE,
    TRUE,
    ARRAY['愛玩', '對小孩友善', '已訓練', '活潑']
),
(
    'Milo',
    '美國短毛貓',
    '8 個月',
    '幼年',
    '公',
    '小型',
    '貓咪',
    '新北市',
    '5.1 公里外',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
    'Milo 是一隻愛撒嬌的小貓，特別喜歡玩雷射筆，是一個完美的公寓伴侶。',
    100,
    TRUE,
    FALSE,
    FALSE,
    ARRAY['愛撒嬌', '安靜']
),
(
    'Rocky',
    '巴哥',
    '4 歲',
    '成年',
    '公',
    '小型',
    '狗狗',
    '台中市',
    '1.2 公里外',
    'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&q=80&w=800',
    'Rocky 是一隻穩重的巴哥混種，非常有規矩，適合新手領養。',
    120,
    TRUE,
    TRUE,
    FALSE,
    ARRAY['穩重', '已訓練']
),
(
    'Charlie',
    '小獵犬',
    '2 歲',
    '成年',
    '公',
    '中型',
    '狗狗',
    '桃園市',
    '5 公里外',
    'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=800',
    'Charlie 是個充滿好奇心的小傢伙。',
    130,
    TRUE,
    TRUE,
    FALSE,
    ARRAY['好奇', '愛跑']
),
(
    'Luna',
    '薩摩耶',
    '6 歲',
    '老年',
    '母',
    '大型',
    '狗狗',
    '台北市',
    '3.0 公里外',
    'https://images.unsplash.com/photo-1529429617329-8a737053918e?auto=format&fit=crop&q=80&w=800',
    'Luna 是一隻溫柔的大白熊，喜歡和人撒嬌。',
    200,
    TRUE,
    TRUE,
    FALSE,
    ARRAY['溫柔', '親人']
),
(
    'Kiki',
    '布偶貓',
    '1 歲',
    '幼年',
    '母',
    '中型',
    '貓咪',
    '台南市',
    '10 公里外',
    'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800',
    'Kiki 是一隻非常漂亮的布偶貓，性格溫順。',
    180,
    TRUE,
    TRUE,
    FALSE,
    ARRAY['安靜', '氣質']
);

-- =============================================
-- 插入幸福故事數據
-- =============================================
INSERT INTO stories (author, pet_name, content, image_url, color)
VALUES 
(
    'Sarah',
    'Luna',
    'Luna 為我們的生活帶來了無限歡樂！謝謝你們協助我們找到她。',
    'https://picsum.photos/seed/sarah/200/200',
    'bg-primary/5'
),
(
    'Mike',
    'Oliver',
    '遇見 Oliver 之前我不認為自己是貓派，但他是我最好的夥伴。',
    'https://picsum.photos/seed/mike/200/200',
    'bg-accent-peach/10'
);

-- =============================================
-- 插入示範訊息對話
-- =============================================
INSERT INTO message_threads (id, user_id, shelter_name, shelter_avatar, pet_name)
VALUES 
(
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000001',
    '快樂爪收容所',
    'https://picsum.photos/seed/shelter/100/100',
    'Bella'
),
(
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000001',
    '暖心貓舍',
    'https://picsum.photos/seed/cats/100/100',
    'Milo'
),
(
    '00000000-0000-0000-0000-000000000013',
    '00000000-0000-0000-0000-000000000001',
    '志工 小林',
    'https://picsum.photos/seed/volunteer/100/100',
    'Rocky'
);

-- 插入示範訊息
INSERT INTO messages (thread_id, sender, text, is_read)
VALUES 
(
    '00000000-0000-0000-0000-000000000011',
    'other',
    '您好，關於您領養 Bella 的申請，我們想與您確認下週二上午 10:00 是否方便前來面談呢？',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000011',
    'user',
    '沒問題的！我會準時到達，謝謝你們。',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000011',
    'other',
    '太棒了！我們到時候見。',
    FALSE
),
(
    '00000000-0000-0000-0000-000000000012',
    'other',
    'Milo 目前非常適應新環境，想請問您居家環境的照片...',
    FALSE
),
(
    '00000000-0000-0000-0000-000000000013',
    'other',
    '謝謝您對流浪動物的關注！',
    TRUE
);

-- =============================================
-- 插入示範領養申請
-- =============================================
-- 先獲取 Bella 和 Rocky 的 ID
DO $$
DECLARE
    bella_id UUID;
    rocky_id UUID;
BEGIN
    SELECT id INTO bella_id FROM pets WHERE name = 'Bella' LIMIT 1;
    SELECT id INTO rocky_id FROM pets WHERE name = 'Rocky' LIMIT 1;
    
    IF bella_id IS NOT NULL THEN
        INSERT INTO adoption_applications (user_id, pet_id, status, housing_type, outdoor_space, is_renting, has_pets, experience, full_name, phone, email, interview_date, interview_time)
        VALUES (
            '00000000-0000-0000-0000-000000000001',
            bella_id,
            'interview',
            'house',
            'fence',
            FALSE,
            FALSE,
            '曾照顧過兩隻狗狗超過 5 年',
            'Alex Chen',
            '0912-345-678',
            'alex@example.com',
            '2024-10-24',
            '10:00:00'
        );
    END IF;
    
    IF rocky_id IS NOT NULL THEN
        INSERT INTO adoption_applications (user_id, pet_id, status, housing_type, outdoor_space, is_renting, has_pets, full_name, phone, email)
        VALUES (
            '00000000-0000-0000-0000-000000000001',
            rocky_id,
            'pending',
            'apartment',
            'balcony',
            TRUE,
            FALSE,
            'Alex Chen',
            '0912-345-678',
            'alex@example.com'
        );
    END IF;
END $$;

-- =============================================
-- 插入示範用戶刊登
-- =============================================
INSERT INTO pet_listings (user_id, name, pet_type, breed, age, gender, size, description, image_url, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Cooper',
    '狗狗',
    '米格魯',
    '1 歲',
    '公',
    '小型',
    'Cooper 是一隻活潑可愛的米格魯，正在尋找溫暖的家。',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200',
    'active'
);

-- =============================================
-- 設定 RLS (Row Level Security) - 可選
-- =============================================
-- 注意：如果要啟用 RLS，需要在 Supabase Dashboard 中配置認證

-- ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Anyone can read pets" ON pets FOR SELECT USING (true);

-- ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can manage own favorites" ON favorites USING (auth.uid()::text = user_id::text);

-- 完成！
SELECT 'Database initialization completed successfully!' AS message;
