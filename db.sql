-- 유저 테이블 생성
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);


-- 유니크 인덱스 추가
CREATE UNIQUE INDEX unq_users_email ON users(email);

-- 전화번호 인덱스 추가
CREATE INDEX idx_users_phone ON users(phone);

-- 사용자 상태 인덱스 추가
CREATE INDEX idx_users_is_active ON users(is_active);

-- 업데이트 트리거 생성 (MySQL의 ON UPDATE CURRENT_TIMESTAMP 대체)
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_timestamp BEFORE UPDATE
ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- 고객 프로필
CREATE TABLE customer_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  profile_image VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TRIGGER update_customer_profiles_timestamp BEFORE UPDATE
ON customer_profiles FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- 사장님 프로필
CREATE TABLE owner_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  profile_image VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TRIGGER update_owner_profiles_timestamp BEFORE UPDATE
ON owner_profiles FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- 업종(카테고리) 테이블
CREATE TABLE store_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TRIGGER update_store_categories_timestamp BEFORE UPDATE
ON store_categories FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- 요일 열거형 타입 생성 (PostgreSQL은 ENUM 타입 직접 생성 지원)
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- 상점 테이블
CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  english_name VARCHAR(100),
  business_registration_number VARCHAR(20) NOT NULL,
  business_registration_file VARCHAR(255),
  category_id INTEGER NOT NULL,
  address VARCHAR(255) NOT NULL,
  address_detail VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  business_hours VARCHAR(255),
  description TEXT,
  logo_image VARCHAR(255),
  banner_image VARCHAR(255),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES owner_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES store_categories(id)
);


CREATE TRIGGER update_stores_timestamp BEFORE UPDATE
ON stores FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- 상점 인덱스
CREATE UNIQUE INDEX unq_stores_business_registration_number ON stores(business_registration_number);
CREATE INDEX idx_stores_name ON stores(name);
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_stores_category_id ON stores(category_id);
CREATE INDEX idx_stores_is_active ON stores(is_active);

-- 영업시간 테이블
CREATE TABLE store_operating_hours (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL,
  day_of_week day_of_week NOT NULL,
  opening_time TIME NOT NULL,
  closing_time TIME NOT NULL,
  break_start_time TIME,
  break_end_time TIME,
  is_day_off BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);


CREATE TRIGGER update_store_operating_hours_timestamp BEFORE UPDATE
ON store_operating_hours FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- 영업시간 인덱스
CREATE INDEX idx_operating_hours_store_day ON store_operating_hours(store_id, day_of_week);

-- 특별 영업일/휴무일 테이블
CREATE TABLE store_special_days (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL,
  date DATE NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  opening_time TIME,
  closing_time TIME,
  reason VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);


CREATE TRIGGER update_store_special_days_timestamp BEFORE UPDATE
ON store_special_days FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- 특별 영업일 인덱스
CREATE INDEX idx_special_days_store_date ON store_special_days(store_id, date);

-- 부가서비스 테이블
CREATE TABLE amenities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);



CREATE TRIGGER update_amenities_timestamp BEFORE UPDATE
ON amenities FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- 상점-부가서비스 연결 테이블 (다대다 관계)
CREATE TABLE store_amenities (
  store_id INTEGER NOT NULL,
  amenity_id INTEGER NOT NULL,
  PRIMARY KEY (store_id, amenity_id),
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);



-- 기본 부가서비스 데이터 삽입
INSERT INTO amenities (name) VALUES 
('주차 가능'),
('와이파이'),
('단체석'),
('유아시설'),
('배달');






-- 상점 운영 상태 테이블 (주문 수신 상태 관리)
CREATE TABLE store_operation_status (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL,
  is_accepting_orders BOOLEAN NOT NULL DEFAULT TRUE,
  pause_until TIMESTAMP,
  pause_reason VARCHAR(255),
  pause_type VARCHAR(20) CHECK (pause_type IN ('temporary', 'today', 'indefinite', NULL)),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  CONSTRAINT chk_pause_reason CHECK (
    (is_accepting_orders = FALSE AND pause_reason IS NOT NULL) OR
    (is_accepting_orders = TRUE)
  )
);


CREATE INDEX idx_store_operation_status_store_id ON store_operation_status(store_id);
CREATE INDEX idx_store_operation_status_accepting ON store_operation_status(is_accepting_orders);

-- 주문 중지 이력 테이블 (통계 및 감사 목적)
CREATE TABLE store_pause_history (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL,
  paused_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resumed_at TIMESTAMP,
  duration INTERVAL,
  pause_reason VARCHAR(255),
  pause_type VARCHAR(20),
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);


CREATE INDEX idx_store_pause_history_store_id ON store_pause_history(store_id);
CREATE INDEX idx_store_pause_history_paused_at ON store_pause_history(paused_at);

-- 트리거 생성: 상태 변경 시 이력 기록
CREATE OR REPLACE FUNCTION log_store_pause()
RETURNS TRIGGER AS $$
BEGIN
  -- 주문 수신이 비활성화 되었을 때
  IF NEW.is_accepting_orders = FALSE AND (OLD IS NULL OR OLD.is_accepting_orders = TRUE) THEN
    INSERT INTO store_pause_history(store_id, pause_reason, pause_type)
    VALUES(NEW.store_id, NEW.pause_reason, NEW.pause_type);
  
  -- 주문 수신이 다시 활성화 되었을 때
  ELSIF NEW.is_accepting_orders = TRUE AND OLD.is_accepting_orders = FALSE THEN
    UPDATE store_pause_history
    SET resumed_at = CURRENT_TIMESTAMP, 
        duration = CURRENT_TIMESTAMP - paused_at
    WHERE store_id = NEW.store_id AND resumed_at IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_store_pause AFTER INSERT OR UPDATE
ON store_operation_status FOR EACH ROW EXECUTE PROCEDURE log_store_pause();

-- 트리거 생성: 새 상점 등록 시 기본 운영 상태 생성
CREATE OR REPLACE FUNCTION create_default_operation_status()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO store_operation_status(store_id, is_accepting_orders)
  VALUES(NEW.id, TRUE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_default_operation_status AFTER INSERT
ON stores FOR EACH ROW EXECUTE PROCEDURE create_default_operation_status();

-- 트리거 생성: 업데이트 시간 자동 갱신
CREATE TRIGGER update_store_operation_status_timestamp BEFORE UPDATE
ON store_operation_status FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- 기능 함수: 주문 일시 중지 옵션 설정
CREATE OR REPLACE FUNCTION set_store_pause_status(
  p_store_id INTEGER,
  p_pause_type VARCHAR(20),
  p_hours INTEGER DEFAULT NULL,
  p_pause_reason VARCHAR(255) DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_pause_until TIMESTAMP;
BEGIN
  -- 옵션에 따른 중지 종료 시간 계산
  CASE 
    WHEN p_pause_type = 'temporary' THEN
      -- 지정된 시간만큼 일시 중지
      v_pause_until := CURRENT_TIMESTAMP + (p_hours || ' hours')::INTERVAL;
      
    WHEN p_pause_type = 'today' THEN
      -- 오늘 하루 종일 (다음날 오전 6시까지)
      v_pause_until := (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '6 hours');
      
    WHEN p_pause_type = 'indefinite' THEN
      -- 무기한 (사장님이 수동으로 재개할 때까지)
      v_pause_until := NULL;
      
    ELSE
      RAISE EXCEPTION '유효하지 않은 일시 중지 옵션입니다.';
  END CASE;

  -- 상태 업데이트
  UPDATE store_operation_status
  SET 
    is_accepting_orders = FALSE,
    pause_until = v_pause_until,
    pause_reason = p_pause_reason,
    pause_type = p_pause_type,
    updated_at = CURRENT_TIMESTAMP
  WHERE store_id = p_store_id;
END;
$$ LANGUAGE plpgsql;

-- 기능 함수: 주문 수신 재개
CREATE OR REPLACE FUNCTION resume_store_orders(
  p_store_id INTEGER
) RETURNS void AS $$
BEGIN
  UPDATE store_operation_status
  SET 
    is_accepting_orders = TRUE,
    pause_until = NULL,
    pause_reason = NULL,
    pause_type = NULL,
    updated_at = CURRENT_TIMESTAMP
  WHERE store_id = p_store_id;
END;
$$ LANGUAGE plpgsql;

-- 기능 함수: 자동 상태 체크 및 업데이트 (정기적으로 실행)
CREATE OR REPLACE FUNCTION auto_check_pause_status()
RETURNS void AS $$
BEGIN
  -- pause_until 시간이 지난 경우 자동 활성화
  UPDATE store_operation_status
  SET 
    is_accepting_orders = TRUE,
    pause_until = NULL,
    pause_reason = NULL,
    pause_type = NULL,
    updated_at = CURRENT_TIMESTAMP
  WHERE 
    is_accepting_orders = FALSE AND
    pause_until IS NOT NULL AND 
    pause_until <= CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;



-- 메뉴 카테고리 테이블
CREATE TABLE menu_categories (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);


CREATE INDEX idx_menu_categories_store_id ON menu_categories(store_id);
CREATE INDEX idx_menu_categories_is_active ON menu_categories(is_active);

CREATE TRIGGER update_menu_categories_timestamp BEFORE UPDATE
ON menu_categories FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- 상품 테이블
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL,
  category_id INTEGER,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  discounted_price NUMERIC(10, 2),
  image_url VARCHAR(255),
  preparation_time INTEGER,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  is_new BOOLEAN NOT NULL DEFAULT FALSE,
  is_recommended BOOLEAN NOT NULL DEFAULT FALSE,
  stock_quantity INTEGER,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE SET NULL
);


CREATE INDEX idx_menu_items_store_id ON menu_items(store_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX idx_menu_items_is_popular ON menu_items(is_popular);

CREATE TRIGGER update_menu_items_timestamp BEFORE UPDATE
ON menu_items FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- 옵션 그룹 테이블 (예: 음료 사이즈, 토핑 종류 등)
CREATE TABLE option_groups (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  min_selections INTEGER NOT NULL DEFAULT 0,
  max_selections INTEGER NOT NULL DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE INDEX idx_option_groups_store_id ON option_groups(store_id);

CREATE TRIGGER update_option_groups_timestamp BEFORE UPDATE
ON option_groups FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- 옵션 아이템 테이블 (예: 대/중/소 사이즈, 치즈 토핑 등)
CREATE TABLE option_items (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL,
  name VARCHAR(50) NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES option_groups(id) ON DELETE CASCADE
);

CREATE INDEX idx_option_items_group_id ON option_items(group_id);
CREATE INDEX idx_option_items_is_available ON option_items(is_available);

CREATE TRIGGER update_option_items_timestamp BEFORE UPDATE
ON option_items FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- 메뉴-옵션 그룹 연결 테이블
CREATE TABLE menu_option_groups (
  menu_id INTEGER NOT NULL,
  option_group_id INTEGER NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (menu_id, option_group_id),
  FOREIGN KEY (menu_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  FOREIGN KEY (option_group_id) REFERENCES option_groups(id) ON DELETE CASCADE
);

CREATE INDEX idx_menu_option_groups_menu_id ON menu_option_groups(menu_id);
CREATE INDEX idx_menu_option_groups_option_group_id ON menu_option_groups(option_group_id);

-- 메뉴 가용성 관리 테이블 (특정 요일/시간대별 판매 여부)
CREATE TABLE menu_availability (
  id SERIAL PRIMARY KEY,
  menu_id INTEGER NOT NULL,
  day_of_week day_of_week,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (menu_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  CONSTRAINT chk_availability CHECK (
    (day_of_week IS NOT NULL AND start_time IS NOT NULL AND end_time IS NOT NULL) OR
    (day_of_week IS NULL AND start_time IS NULL AND end_time IS NULL)
  )
);

CREATE INDEX idx_menu_availability_menu_id ON menu_availability(menu_id);
CREATE INDEX idx_menu_availability_day_of_week ON menu_availability(day_of_week);

CREATE TRIGGER update_menu_availability_timestamp BEFORE UPDATE
ON menu_availability FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();


-- 트리거: 상점이 삭제되면 해당 상점의 메뉴 카테고리와 상품도 모두 삭제
CREATE OR REPLACE FUNCTION clean_up_store_menus()
RETURNS TRIGGER AS $$
BEGIN
  -- 메뉴 카테고리 삭제
  DELETE FROM menu_categories WHERE store_id = OLD.id;
  
  -- 메뉴 아이템 삭제
  DELETE FROM menu_items WHERE store_id = OLD.id;
  
  -- 옵션 그룹 삭제
  DELETE FROM option_groups WHERE store_id = OLD.id;
  

  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clean_up_store_menus BEFORE DELETE
ON stores FOR EACH ROW EXECUTE PROCEDURE clean_up_store_menus();





-- 간단한 혜택 테이블
CREATE TABLE store_benefits (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  condition_description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE INDEX idx_store_benefits_store_id ON store_benefits(store_id);
CREATE INDEX idx_store_benefits_is_active ON store_benefits(is_active);
CREATE INDEX idx_store_benefits_start_date ON store_benefits(start_date);
CREATE INDEX idx_store_benefits_end_date ON store_benefits(end_date);

CREATE TRIGGER update_store_benefits_timestamp BEFORE UPDATE
ON store_benefits FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();









-- 주문 상태 열거형 타입
CREATE TYPE order_status AS ENUM (
  'pending',      -- 주문 대기 (고객이 주문했지만 사장님이 아직 확인하지 않음)
  'accepted',     -- 주문 수락 (사장님이 주문을 수락함)
  'rejected',     -- 주문 거부 (사장님이 주문을 거부함)
  'preparing',    -- 조리중 (음식 준비 중)
  'ready',        -- 준비 완료 (픽업 가능)
  'completed',    -- 완료 (고객이 픽업함)
  'canceled'      -- 취소됨 (고객이 취소하거나 시스템에 의해 취소됨)
);

-- 결제 상태 열거형 타입
CREATE TYPE payment_status AS ENUM (
  'pending',      -- 결제 대기
  'completed',    -- 결제 완료
  'failed',       -- 결제 실패
  'refunded',     -- 환불됨
  'partially_refunded' -- 부분 환불됨
);

-- 결제 방법 열거형 타입
CREATE TYPE payment_method AS ENUM (
  'credit_card',  -- 신용카드
  'bank_transfer', -- 계좌이체
  'mobile_payment', -- 모바일 결제
  'point',        -- 포인트
  'cash',         -- 현금
  'other'         -- 기타
);

-- 주문 테이블
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(20) NOT NULL UNIQUE,  -- 주문 번호 (고객에게 표시됨)
  customer_id INTEGER NOT NULL,              -- 주문한 고객
  store_id INTEGER NOT NULL,                 -- 주문한 상점
  status order_status NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(10, 2) NOT NULL,      -- 총 주문 금액
  discount_amount NUMERIC(10, 2) DEFAULT 0,  -- 할인 금액
  final_amount NUMERIC(10, 2) NOT NULL,      -- 최종 결제 금액
  payment_status payment_status NOT NULL DEFAULT 'pending', -- 결제 상태
  payment_method payment_method,             -- 결제 방법
  pickup_time TIMESTAMP NOT NULL,            -- 예약된 픽업 시간
  actual_pickup_time TIMESTAMP,              -- 실제 픽업 시간
  customer_note TEXT,                        -- 고객 요청사항
  rejection_reason TEXT,                     -- 주문 거부 이유 (거부된 경우)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE RESTRICT,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE RESTRICT
);


CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_pickup_time ON orders(pickup_time);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE TRIGGER update_orders_timestamp BEFORE UPDATE
ON orders FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- 주문 항목 테이블 (주문에 포함된 메뉴 항목)
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  menu_item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,        -- 개당 가격 (주문 시점의 가격)
  total_price NUMERIC(10, 2) NOT NULL,       -- 항목 총 가격 (수량 * 개당 가격)
  special_instructions TEXT,                 -- 특별 요청사항 (예: "소스 적게 주세요")
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
);



CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);

CREATE TRIGGER update_order_items_timestamp BEFORE UPDATE
ON order_items FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- 주문 항목 옵션 테이블 (주문 항목에 선택된 옵션들)
CREATE TABLE order_item_options (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER NOT NULL,
  option_item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,       -- 옵션 수량
  price NUMERIC(10, 2) NOT NULL,             -- 옵션 가격 (주문 시점의 가격)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  FOREIGN KEY (option_item_id) REFERENCES option_items(id) ON DELETE RESTRICT
);


CREATE INDEX idx_order_item_options_order_item_id ON order_item_options(order_item_id);
CREATE INDEX idx_order_item_options_option_item_id ON order_item_options(option_item_id);

CREATE TRIGGER update_order_item_options_timestamp BEFORE UPDATE
ON order_item_options FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- 주문 상태 이력 테이블 (주문 상태 변경 추적)
CREATE TABLE order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  previous_status order_status,
  new_status order_status NOT NULL,
  changed_by INTEGER,                        -- 상태를 변경한 사용자 ID (NULL인 경우 시스템)
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason TEXT,                               -- 상태 변경 이유
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);


CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_changed_at ON order_status_history(changed_at);

-- 주문 알림 테이블
CREATE TABLE order_notifications (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,             -- 알림 수신자 (고객 또는 사장님)
  recipient_type VARCHAR(20) NOT NULL,       -- 'customer' 또는 'owner'
  type VARCHAR(50) NOT NULL,                 -- 알림 유형 (예: 'order_accepted', 'pickup_ready')
  title VARCHAR(100) NOT NULL,               -- 알림 제목
  message TEXT NOT NULL,                     -- 알림 내용
  is_read BOOLEAN NOT NULL DEFAULT FALSE,    -- 읽음 여부
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,                         -- 읽은 시간
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_order_notifications_order_id ON order_notifications(order_id);
CREATE INDEX idx_order_notifications_recipient_id ON order_notifications(recipient_id);
CREATE INDEX idx_order_notifications_recipient_type ON order_notifications(recipient_type);
CREATE INDEX idx_order_notifications_is_read ON order_notifications(is_read);
CREATE INDEX idx_order_notifications_sent_at ON order_notifications(sent_at);

-- 주문 결제 정보 테이블
CREATE TABLE order_payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL UNIQUE,          -- 1:1 관계 (주문당 하나의 결제)
  amount NUMERIC(10, 2) NOT NULL,            -- 결제 금액
  payment_method payment_method NOT NULL,    -- 결제 방법
  payment_status payment_status NOT NULL,    -- 결제 상태
  transaction_id VARCHAR(100),               -- 외부 결제 시스템의 거래 ID
  payment_details JSONB,                     -- 결제 관련 추가 정보 (JSON 형식)
  paid_at TIMESTAMP,                         -- 결제 완료 시간
  refunded_at TIMESTAMP,                     -- 환불 처리 시간
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);


CREATE INDEX idx_order_payments_payment_status ON order_payments(payment_status);
CREATE INDEX idx_order_payments_paid_at ON order_payments(paid_at);

CREATE TRIGGER update_order_payments_timestamp BEFORE UPDATE
ON order_payments FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- 주문 번호 생성 함수
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(20) AS $$
DECLARE
  v_date CHAR(8);
  v_random CHAR(6);
  v_order_number VARCHAR(20);
  v_exists BOOLEAN;
BEGIN
  -- 날짜 형식: YYYYMMDD
  v_date := TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD');
  
  -- 중복되지 않는 번호가 생성될 때까지 반복
  LOOP
    -- 6자리 랜덤 숫자
    v_random := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    v_order_number := v_date || '-' || v_random;
    
    -- 중복 확인
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = v_order_number) INTO v_exists;
    
    -- 중복되지 않으면 반환
    IF NOT v_exists THEN
      RETURN v_order_number;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 주문 상태 변경 시 이력 추가 트리거
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (
      order_id, previous_status, new_status, changed_at
    ) VALUES (
      NEW.id, OLD.status, NEW.status, CURRENT_TIMESTAMP
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_order_status_change AFTER UPDATE
ON orders FOR EACH ROW EXECUTE PROCEDURE log_order_status_change();

-- 주문 상태 변경 시 알림 생성 함수 
CREATE OR REPLACE FUNCTION create_order_status_notification(
  p_order_id INTEGER,
  p_status order_status
)
RETURNS void AS $$
DECLARE
  v_customer_id INTEGER;
  v_store_id INTEGER;
  v_owner_id INTEGER;
  v_title VARCHAR(100);
  v_message TEXT;
  v_notification_type VARCHAR(50);
BEGIN
  -- 주문 정보 가져오기
  SELECT o.customer_id, o.store_id, s.owner_id
  INTO v_customer_id, v_store_id, v_owner_id
  FROM orders o
  JOIN stores s ON o.store_id = s.id
  WHERE o.id = p_order_id;
  
  -- 상태별 알림 설정
  CASE p_status
    WHEN 'pending' THEN
      -- 사장님에게 새 주문 알림
      v_notification_type := 'new_order';
      v_title := '새로운 주문이 들어왔습니다';
      v_message := '새로운 주문(#' || p_order_id || ')이 접수되었습니다. 확인해주세요.';
      
      INSERT INTO order_notifications (
        order_id, recipient_id, recipient_type, type, title, message
      ) VALUES (
        p_order_id, v_owner_id, 'owner', v_notification_type, v_title, v_message
      );
      
    WHEN 'accepted' THEN
      -- 고객에게 주문 수락 알림
      v_notification_type := 'order_accepted';
      v_title := '주문이 수락되었습니다';
      v_message := '회원님의 주문이 가게에서 수락되었습니다. 조리가 시작됩니다.';
      
      INSERT INTO order_notifications (
        order_id, recipient_id, recipient_type, type, title, message
      ) VALUES (
        p_order_id, v_customer_id, 'customer', v_notification_type, v_title, v_message
      );
      
    WHEN 'rejected' THEN
      -- 고객에게 주문 거부 알림
      v_notification_type := 'order_rejected';
      v_title := '주문이 거부되었습니다';
      v_message := '죄송합니다. 회원님의 주문이 가게 사정으로 인해 거부되었습니다.';
      
      INSERT INTO order_notifications (
        order_id, recipient_id, recipient_type, type, title, message
      ) VALUES (
        p_order_id, v_customer_id, 'customer', v_notification_type, v_title, v_message
      );
      
    WHEN 'preparing' THEN
      -- 고객에게 조리 시작 알림
      v_notification_type := 'order_preparing';
      v_title := '주문하신 음식 조리가 시작되었습니다';
      v_message := '회원님이 주문하신 음식이 현재 조리 중입니다.';
      
      INSERT INTO order_notifications (
        order_id, recipient_id, recipient_type, type, title, message
      ) VALUES (
        p_order_id, v_customer_id, 'customer', v_notification_type, v_title, v_message
      );
      
    WHEN 'ready' THEN
      -- 고객에게 픽업 준비 완료 알림
      v_notification_type := 'pickup_ready';
      v_title := '음식 준비가 완료되었습니다';
      v_message := '주문하신 음식이 준비되었습니다. 픽업 가능합니다.';
      
      INSERT INTO order_notifications (
        order_id, recipient_id, recipient_type, type, title, message
      ) VALUES (
        p_order_id, v_customer_id, 'customer', v_notification_type, v_title, v_message
      );
      
    WHEN 'completed' THEN
      -- 양측에 주문 완료 알림
      v_notification_type := 'order_completed';
      
      -- 고객 알림
      v_title := '주문이 완료되었습니다';
      v_message := '주문이 성공적으로 완료되었습니다. 이용해 주셔서 감사합니다.';
      
      INSERT INTO order_notifications (
        order_id, recipient_id, recipient_type, type, title, message
      ) VALUES (
        p_order_id, v_customer_id, 'customer', v_notification_type, v_title, v_message
      );
      
      -- 사장님 알림
      v_title := '주문이 완료되었습니다';
      v_message := '주문(#' || p_order_id || ')이 성공적으로 완료되었습니다.';
      
      INSERT INTO order_notifications (
        order_id, recipient_id, recipient_type, type, title, message
      ) VALUES (
        p_order_id, v_owner_id, 'owner', v_notification_type, v_title, v_message
      );
      
    WHEN 'canceled' THEN
      -- 양측에 주문 취소 알림
      v_notification_type := 'order_canceled';
      
      -- 고객 알림
      v_title := '주문이 취소되었습니다';
      v_message := '회원님의 주문이 취소되었습니다.';
      
      INSERT INTO order_notifications (
        order_id, recipient_id, recipient_type, type, title, message
      ) VALUES (
        p_order_id, v_customer_id, 'customer', v_notification_type, v_title, v_message
      );
      
      -- 사장님 알림
      v_title := '주문이 취소되었습니다';
      v_message := '주문(#' || p_order_id || ')이 취소되었습니다.';
      
      INSERT INTO order_notifications (
        order_id, recipient_id, recipient_type, type, title, message
      ) VALUES (
        p_order_id, v_owner_id, 'owner', v_notification_type, v_title, v_message
      );
      
    ELSE
      -- 기타 상태에 대한 처리
      NULL;
  END CASE;
  
END;
$$ LANGUAGE plpgsql;

-- 주문 상태 변경 시 알림 생성 트리거
CREATE OR REPLACE FUNCTION trigger_order_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM create_order_status_notification(NEW.id, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_status_notification AFTER UPDATE
ON orders FOR EACH ROW EXECUTE PROCEDURE trigger_order_status_notification();

-- 새 주문 생성 시 알림 트리거
CREATE OR REPLACE FUNCTION trigger_new_order_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_order_status_notification(NEW.id, NEW.status);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_new_order_notification AFTER INSERT
ON orders FOR EACH ROW EXECUTE PROCEDURE trigger_new_order_notification();



CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  session_token VARCHAR(255) NOT NULL,
  refresh_token VARCHAR(255),
  device_info JSONB,  -- 디바이스 정보 (브라우저, OS 등)
  ip_address VARCHAR(45),  -- IPv6까지 고려한 길이
  last_activity_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_valid BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 세션 관련 인덱스 생성
CREATE UNIQUE INDEX unq_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_is_valid ON user_sessions(is_valid);

-- 세션 업데이트 트리거
CREATE TRIGGER update_user_sessions_timestamp BEFORE UPDATE
ON user_sessions FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- 세션 정리를 위한 함수 (만료된 세션 삭제)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions 
  WHERE expires_at < CURRENT_TIMESTAMP 
  OR is_valid = FALSE;
END;
$$ LANGUAGE plpgsql;
