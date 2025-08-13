-- SENOPLAN SAMPLE DATA
-- Initial data for Supabase deployment

-- 1. Insert default admin user (password: anakrumahan123)
-- Password is hashed using bcrypt with cost 10
INSERT INTO users (id, email, username, balance, role, status, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@senoplan.com', 'admin', 1000000, 'admin', 'online', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Insert sample player (password: player123)
INSERT INTO users (id, email, username, balance, role, status, created_at) VALUES
('40220000-0000-0000-0000-000000000000', 'player@example.com', 'player1', 990000, 'player', 'online', NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Initialize server status for both servers
INSERT INTO server_status (server_id, is_active, current_round, next_result, last_result, total_bets, total_players) VALUES
('server1', false, 0, '[]', '[]', 0, 0),
('server2', false, 0, '[]', '[]', 0, 0)
ON CONFLICT (server_id) DO NOTHING;

-- 4. Initialize game timers
INSERT INTO game_timers (server_id, status, current_time, max_time, round_number) VALUES
('server1', 'stopped', 0, 60, 0),
('server2', 'stopped', 0, 60, 0)
ON CONFLICT (server_id) DO NOTHING;

-- 5. Add sample chat message
INSERT INTO chat_messages (user_id, username, message, message_type, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Admin', 'Selamat datang di SENOPLAN!', 'admin', NOW() - INTERVAL '1 hour'),
('11111111-1111-1111-1111-111111111111', 'Admin', 'Server maintenance akan dilakukan pukul 03:00 WIB', 'admin', NOW() - INTERVAL '30 minutes');

-- 6. Add sample betting activities
INSERT INTO betting_activities (user_id, server_id, bet_amount, bet_numbers, bet_type, status, result_numbers, win_amount, created_at) VALUES
('40220000-0000-0000-0000-000000000000', 'server1', 10000, '["1", "2", "3"]', 'number', 'pending', '[]', 0, NOW() - INTERVAL '10 minutes'),
('40220000-0000-0000-0000-000000000000', 'server1', 20000, '[]', 'besar', 'pending', '[]', 0, NOW() - INTERVAL '5 minutes');

-- 7. Add sample withdrawal request
INSERT INTO withdrawal_requests (user_id, username, amount, status, created_at) VALUES
('40220000-0000-0000-0000-000000000000', 'player1', 500000, 'pending', NOW() - INTERVAL '1 day');

-- 8. Add sample game results
INSERT INTO game_results (server_id, round_number, winning_numbers, total_bets, total_winnings, created_at) VALUES
('server1', 1, '["1", "4", "7"]', 500000, 4500000, NOW() - INTERVAL '1 day'),
('server1', 2, '["0", "5", "9"]', 700000, 6300000, NOW() - INTERVAL '23 hours'),
('server1', 3, '["2", "3", "8"]', 300000, 2700000, NOW() - INTERVAL '1 hour');

-- 9. Add sample broadcast
INSERT INTO broadcasts (admin_id, message, type, is_active, expires_at, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'SELAMAT DATANG DI SENOPLAN', 'info', true, NOW() + INTERVAL '7 days', NOW() - INTERVAL '1 day'),
('11111111-1111-1111-1111-111111111111', 'PERHATIAN: Akan ada maintenance server besok pukul 03:00 WIB', 'warning', true, NOW() + INTERVAL '1 day', NOW() - INTERVAL '1 hour');

-- 10. Create initial session for admin
INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, is_active, last_activity) VALUES
('11111111-1111-1111-1111-111111111111', 'admin_session_token_123', '127.0.0.1', 'Mozilla/5.0', true, NOW());

-- Update sequence values to avoid conflicts
SELECT setval('users_id_seq', (SELECT MAX(EXTRACT(EPOCH FROM id::text::uuid)) FROM users));
SELECT setval('betting_activities_id_seq', (SELECT MAX(EXTRACT(EPOCH FROM id::text::uuid)) FROM betting_activities));
SELECT setval('chat_messages_id_seq', (SELECT MAX(EXTRACT(EPOCH FROM id::text::uuid)) FROM chat_messages));
SELECT setval('withdrawal_requests_id_seq', (SELECT MAX(EXTRACT(EPOCH FROM id::text::uuid)) FROM withdrawal_requests));
SELECT setval('game_results_id_seq', (SELECT MAX(EXTRACT(EPOCH FROM id::text::uuid)) FROM game_results));

-- Print success message
DO $$
BEGIN
    RAISE NOTICE '✅ Sample data has been successfully inserted';
    RAISE NOTICE 'Admin login: 1111 / anakrumahan123';
    RAISE NOTICE 'Sample player login: player@example.com / player123';
END $$;
