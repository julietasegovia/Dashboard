function Snowglobe({children, className=''}) {
    return (
        <div className={`relative min-h-[330px] overflow-hidden shadow-[0_14px_34px_rgba(52,105,151,.09)] max-[850px]:min-h[300px] ${className}`}>
            <div className="absolute inset-x-0 top-0 bottom-[25px] overflow-hidden rounded-full border-white/95 bg-[radial-gradient(circle_at_50%_18%,#fafdff_0,#dff1ff_48%,#b9dcf4_100%)] shadow-[inset_0_0_34px_rgba(255,255,255,.85),0_12px_24px_rgba(47,113,164,.13)]">
                {children}
            </div>
            <div className="absolute inset-x-[7%] bottom-5 h-12 rounded-t bg-linear-to-b from-[#78b2d9] to-[#3f7eaf] [clip-path:polygon(10%_0,90%_0,100%_100%,0_100%)]"/>
            <span aria-hidden="true" className="absolute top-[69px] left-1/4 z-[1] size-1 rounded-full bg-white opacity-80 shadow-[35px_42px_#fff,120px_25px_#fff,195px_72px_#fff,155px_126px_#fff,60px_140px_#fff]"></span>
        </div>
    )
}

const wrap = 'relative z-[1] mx-auto w-full max-w-[1080px]'

function Sparkle({className=''}){
    return(
        <span aria-hidden="true" className={`absolute z-[3] text-white opacity-80 ${className}`}>
          ✦
        </span>
    )
}

export default function Page(){
    return(
        <main className="relative min-h-screen overflow-hidden bg-[#edf5ff] bg-[radial-gradient(circle_at_78%_0%,#fff_0,transparent_34%)] px-[clapm(24px,5vw,78px)] pt-6 pb-6 max-[560px]:px-[17px] max-[560px]:py-5">
            <div className="pointer-events-none absolute -right-[90px] top-[210px] size-[260px] rounded-full bg-[#c8e4ff] opacity-65 blur-[1px]"></div>
            <div className="pointer-events-none absolute -left-20 bottom-10 size-[180px] rounded-full bg-[#d9edff] opacity-80 blur-[1px]"></div>
        
            <header className={`${wrap} flex items-center justify-between`}>
                <div className="flex items-center gap-2.5 text-[11px] font-bold tracking-[.18rem] text-[#215b91]">
                    <span className="relative size-[22px] rounded-full border-[1.5px] border-[#4d91c9] after:absolute after:top-[7px] after:left-[7px] after:size-[5px] after:rounded-full after:bg-[#76b9ed] after:content-['']">Snowboard</span>
                </div>
                <nav aria-label="main navigator" className="flex gap-[34px] text-xs text-[#7d9dbd] max-[850px]:hidden">
                    <a href="#overview" className="text-[#1f6099] after:mx-auto after:mt-[7px] after:block after:size-1 after:rounded-full after:bg-[#4c9bd2] after:content-['']">Overview</a>
                    <a href="#activity">Activity</a>
                    <a href="#settings">Settings</a>
                </nav>
            </header>

            <section id="overview" className={`${wrap} flex items-end justify-between pt-[66px] pb-[42px] max-[850px]:flex-col max-[850px]:items-start max-[850px]:gap-6 max-[850px]:pt-[58px] max-[850px]:pb-[38px]`}>
                <div>
                    <p className={kicker}> WEDNESDAY, OCTOBER 07, 2026 <span className="mx-[5px] text-[#4da2d7]">·</span> 10:40 AM</p>
                    <h1 className="mt-[17px] mb-3.5 text-[clamp(43px,5vw,68px)] leading-[.98] font-[650] tracking-[-.055em] text-[#174b7a] max-[560px]:text-[46px]">
                        Snowboard, <em className="text-[#3b91cb] not-italict">slide through your stats.</em></h1>
                </div>
            </section>

            <section aria-label="Dashboard" className={`${wrap} grid grid-cols-[1.02fr_1fr_1fr] items-stretch gap-[19px] max-[850px]:grid-cols-2 max-[560px]:grid-cols-1`}>
                <Snowglobe>
                    <Sparkle className="top-[70px] right-7 text-[11px]"></Sparkle>
                    <Sparkle className="top-[132px] left-[30px] text-[8px]"></Sparkle>
                    <div className="absolute right-1/2 bottom-[42px] h-[82px] w-[145px] origin-bottom translate-x-1/2 scale-[.85] rounded-[58%_58%_40%_40%] bg-[#aed6ef] opacity-75">
                        <span className="absolute -top-[43px] right-[22px] text-[97px] text-[#76b9e6] opacity-85">☼</span>
                        <span className="absolute bottom-[15px] h-[26px] w-20 rounded-[30px] bg-[#d4ecfb] shadow-[20px_-10px_0_-4px_#d4ecfb,45px_0_0_-5px_#d4ecfb]"></span>
                        <span className="absolute bottom-[37px] -left-[39px] h-[26px] w-20 scale-[.55] rounded-[30px] bg-[#d4ecfb] shadow-[20px_-10px_0_-4px_#d4ecfb,45px_0_0_-5px_#d4ecfb]"></span>
                    </div>
                    <div className="absolute inset-x-5 top-[34px] z-[2] text-center max-[560px]:inset-x-4 max-[560px]:top-[30px]">
                        <p className="mt-4 text-[58px] leading-none font-[650] tracking-[-0.5rem] text-[#1a5687]">Today&apos;s Weather</p>
                        <div className="mt-4 text-[58px] leading-none font-[650] tracking-[-.05em] text-[#1a5687]">
                        12<span className="align-top text-[19px] tracking-normal text-[#5a91b7]">°C</span>
                        </div>
                        <p className="mt-3 text-xs leading-[1.6] text-[#5f8aae]">
                        Clear skies with a gentle<br />breeze throughout the day.
                        </p>
                        <div className="mt-[22px] flex justify-center gap-3.5 text-[10px] text-[#6e9abc]">
                            <span><b className="font-semibold text-[#3978a7]">18°</b> high</span>
                            <span><b className="font-semibold text-[#3978a7]">7°</b> low</span>
                            <span><b className="font-semibold text-[#3978a7]">42%</b> humidity</span>
                        </div>
                    </div>
                </Snowglobe>

                <article className={`${panel} min-h-[295px]`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className={kicker}>The daily drift</p>
                            <h2 className={heading}>What's going on?</h2>
                        </div>
                        <button className="cursor-pointer tracking-[3px]  text-[#6b9ac0]" aria-label="More news">...</button>
                    </div>
                    <div className="mt-[23px] flex flex-col">
                        {headlines.map((h, i) => (
                            <a key={h.titlr} href={`#story-${i+1}`} className="grid grid-cols-[22px_1fr_16px] gap-2.5 border-t border-[#dcebf6] py-3.5">
                                <span className="text-[13px] text-[#4d98cb]">0{i + 1}</span>
                                <span>
                                    <small className="mb-[5px] block text-[9px] tracking-[.13em] text-[#6e96b6]">{h.category}</small>
                                    <strong className="block text-sm leading-[1.3] font-medium text-[#315f87]">{h.title}</strong>
                                    <small className="mt-1.5 block text-[9px] text-[#88a9c2]">{h.time}</small>
                                </span>
                                <span className="text-[15px] text-[#5298c7]">↗</span>
                            </a>
                        ))}
                    </div>
                </article>
                
            </section>
        </main>
    )
}
