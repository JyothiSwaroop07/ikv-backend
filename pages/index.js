import React from "react";
import { useRouter } from "next/router";

const Home = () => {

  const router = useRouter();

  const route = async (cid) => {
    await router.push(`/${cid}`);
  }

  return (
    <div className="flex flex-col gap-16 justify-center items-center ">

      <h1 className="text-center w-[80vw] text-lg text-bold">Click below buttons to enter the respective contest details into Database</h1>

      <button className="w-[145px] h-[45px] bg-green-700 text-white mx-5" onClick={() => route('Announcements')}>Announcements</button>
      <button className="w-[145px] h-[45px] bg-green-700 text-white mx-5" onClick={() => route('NewContest')}>NewContest</button>
      <button className="w-[145px] h-[45px] bg-green-700 text-white mx-5" onClick={() => route('contest1')}>நிகழ்ச்சி 1: ரமலான் தொடர் பயான்</button>
      <button className="w-[145px] h-[45px] bg-green-700 text-white" onClick={() => route('contest2')}>நிகழ்ச்சி 2: தினம் ஒரு கேள்வி</button>
      <button className="w-[145px] h-[45px] bg-green-700 text-white" onClick={() => route('contest3')}>நிகழ்ச்சி 3: ஓர் அழகிய உபதேசம்</button>
      <button className="w-[145px] h-[45px] bg-green-700 text-white mb-5" onClick={() => route('Results')}>Results</button>
      <button className="w-[145px] h-[45px] bg-green-700 text-white mb-5" onClick={() => route('ArivomAinthu')}>Arivom Ainthu</button>
      <button className="w-[145px] h-[45px] bg-green-700 text-white mb-5" onClick={() => route('Sponsors')}>Sponsors</button>
    </div>
  )
}

export default Home;
