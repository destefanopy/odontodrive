const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = "https://ziisylrssmehuokesqav.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppaXN5bHJzc21laHVva2VzcWF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzk3NjY2MiwiZXhwIjoyMDg5NTUyNjYyfQ.u-iZUB90_kphkZZnv51ae6Qz3hCxKoEeZkpJ7heG4VI";

const supabase = createClient(supabaseUrl, supabaseKey);

const main = async () => {
  const { data, error } = await supabase
    .from('dodo_logs')
    .select('created_at, log_data')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (error) {
    console.error("Error fetching", error);
    return;
  }

  for (const log of data) {
    console.log("-----------------------------------------");
    console.log("CREATED AT:", log.created_at);
    // only print type and IDs
    if (log.log_data.type) {
      console.log("EVENT TYPE:", log.log_data.type);
      console.log("EVENT DATA SUB_ID:", log.log_data.data?.subscription_id);
    } else {
      console.log("HEADERS:", log.log_data.headers ? "yes" : "no");
      console.log("RAW BODY TYPE:", typeof log.log_data.raw === 'string' ? JSON.parse(log.log_data.raw).type : 'none');
    }
  }
};

main();
