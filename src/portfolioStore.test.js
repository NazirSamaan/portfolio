import { supabase } from './supabaseClient';
import { verifyOwner, publishPortfolio } from './portfolioStore';
import { defaultContent } from './portfolioData';

jest.mock('./supabaseClient',()=>({supabase:{auth:{getUser:jest.fn()},rpc:jest.fn()}}));
beforeEach(()=>jest.resetAllMocks());

test('does not trust an absent or invalid auth user', async()=>{
  supabase.auth.getUser.mockResolvedValue({data:{user:null},error:{message:'expired'}});
  expect(await verifyOwner()).toBe(false);
  expect(supabase.rpc).not.toHaveBeenCalled();
});

test('a signed-in account without server owner permission cannot publish', async()=>{
  supabase.auth.getUser.mockResolvedValue({data:{user:{id:'other'}},error:null});
  supabase.rpc.mockResolvedValue({data:false,error:null});
  await expect(publishPortfolio(defaultContent,0)).rejects.toThrow('not the owner');
  expect(supabase.rpc).toHaveBeenCalledTimes(1);
  expect(supabase.rpc).toHaveBeenCalledWith('is_portfolio_owner');
});

test('publishes only after owner verification and sends the expected version', async()=>{
  supabase.auth.getUser.mockResolvedValue({data:{user:{id:'owner'}},error:null});
  supabase.rpc.mockResolvedValueOnce({data:true,error:null}).mockResolvedValueOnce({data:[{data:defaultContent,version:8}],error:null});
  const result=await publishPortfolio(defaultContent,7);
  expect(supabase.rpc.mock.calls[1][0]).toBe('save_portfolio');
  expect(supabase.rpc.mock.calls[1][1].expected_version).toBe(7);
  expect(result.version).toBe(8);
});

test('reports version conflicts instead of claiming that changes were saved', async()=>{
  supabase.auth.getUser.mockResolvedValue({data:{user:{id:'owner'}},error:null});
  supabase.rpc.mockResolvedValueOnce({data:true,error:null}).mockResolvedValueOnce({data:[],error:null});
  await expect(publishPortfolio(defaultContent,3)).rejects.toThrow('another session');
});
