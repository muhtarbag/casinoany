-- Site sahiplerinin kendi sitelerinin sosyal medya bilgilerini güncelleyebilmesi için policy ekle
CREATE POLICY "Site owners can manage their site social links"
ON betting_sites_social
FOR ALL
USING (
  site_id IN (
    SELECT bs.id 
    FROM betting_sites bs
    WHERE bs.owner_id = auth.uid()
  )
)
WITH CHECK (
  site_id IN (
    SELECT bs.id 
    FROM betting_sites bs
    WHERE bs.owner_id = auth.uid()
  )
);