-- Site sahipleri kendi sitelerinin bonuslarını görebilsin
CREATE POLICY "Site owners can view their site bonuses"
ON bonus_offers
FOR SELECT
TO authenticated
USING (
  site_id IN (
    SELECT site_id 
    FROM site_owners 
    WHERE user_id = auth.uid() 
      AND status = 'approved'
  )
);

-- Site sahipleri kendi sitelerine bonus ekleyebilsin
CREATE POLICY "Site owners can insert bonuses for their sites"
ON bonus_offers
FOR INSERT
TO authenticated
WITH CHECK (
  site_id IN (
    SELECT site_id 
    FROM site_owners 
    WHERE user_id = auth.uid() 
      AND status = 'approved'
  )
);

-- Site sahipleri kendi sitelerinin bonuslarını güncelleyebilsin
CREATE POLICY "Site owners can update their site bonuses"
ON bonus_offers
FOR UPDATE
TO authenticated
USING (
  site_id IN (
    SELECT site_id 
    FROM site_owners 
    WHERE user_id = auth.uid() 
      AND status = 'approved'
  )
);

-- Site sahipleri kendi sitelerinin bonuslarını silebilsin
CREATE POLICY "Site owners can delete their site bonuses"
ON bonus_offers
FOR DELETE
TO authenticated
USING (
  site_id IN (
    SELECT site_id 
    FROM site_owners 
    WHERE user_id = auth.uid() 
      AND status = 'approved'
  )
);