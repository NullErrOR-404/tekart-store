const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fvmspqxqektnvylqlafw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bXNwcXhxZWt0bnZ5bHFsYWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExOTA3MDQsImV4cCI6MjA5Njc2NjcwNH0.BJIK7eyLFvvdBJ4JqeIbjBK6yl-1Tja05h2CkNTZ8JQ'
);

async function run() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Product columns:', Object.keys(data[0] || {}));
  }
}
run();
