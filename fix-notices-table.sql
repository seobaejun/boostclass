-- notices 테이블 author_id 컬럼 제거 (존재하는 경우)
DO $$ 
BEGIN
    -- author_id 컬럼이 존재하는지 확인하고 제거
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notices' 
        AND column_name = 'author_id'
    ) THEN
        ALTER TABLE notices DROP COLUMN author_id;
        RAISE NOTICE 'author_id 컬럼이 제거되었습니다.';
    ELSE
        RAISE NOTICE 'author_id 컬럼이 존재하지 않습니다.';
    END IF;
END $$;

-- 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'notices'
ORDER BY ordinal_position;
