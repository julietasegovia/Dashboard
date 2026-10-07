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
                <div></div>
            </header>
        </main>
    )
}
