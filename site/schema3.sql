-- Okul lisansı üye sınırı (okula özel üst sınır; boşsa plan 'uye' değeri, o da yoksa 50)
ALTER TABLE schools ADD COLUMN max_members INTEGER;
