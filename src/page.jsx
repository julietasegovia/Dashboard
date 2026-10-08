import { useEffect, useMemo } from "react"
import Particles, { ParticlesProvider } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import {useApi} from  './services/useApi.js'

function initSnow(engine) {
    return loadSlim(engine)
}

function SnowParticles(){
    const options = useMemo(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        return {
            fullScreen: {enable:false},
            background: {color: {value: 'transparent'}},
            fpsLimit: 60,
            detectRetina: true,
            particles: {
                number:{value: 60, desnity: {enable: true, width: 400,height: 400}},
                color: {value: '#ffffff'},
                shape: {type: 'triangle'},
                opacity: {value: {min: 0.45, max: 0.95}},
                size: {value: {min: 1.5, max: 4.5}},
                move: {
                    enable: !reduceMotion,
                    direction: 'bottom',
                    speed: {min: 0.4, max: 1.4},
                    straight: false,
                    drift: {min: -0.6, max: 0.6},
                    outModes: {default: 'out'},
                },
            },
        }
    }, [])

    return (
        <ParticlesProvider init={initSnow}>
            <Particles id="snowglobe-snow" options={options} className="pointer-events-none absolute inset-0 z-[1]"/>
        </ParticlesProvider>
    )
}

//placeholders
const headlines = [
    {category: '', title: 'news 1'},
    {category: '', title: 'news 2'},
    {category: '', title: 'news 3'},
]

const barHeights=[40,65,54,90,73,48,22]

const wrap = 'relative z-10 mx-auto w-full w-max-[1220-x]'
const panel = 'rounded-[14px] border border-[#c9e0f2] bg-white/70 p-[25px] shadow-[0_14px_34px_rgba(52,105,151,.09)]'
const kicker = 'text-[10px] font-bold tracking-[.16em] text-[#6d91b4]'
const heading = 'mt-[9px] text-[23px] font-semibold text-[#1d4e7c]'

function Snowglobe({children, className=''}) {
    return (
        <div className={`@container relative mx-auto aspect-square w-full max-w-[420px] self-center justify-self-center ${className}`}>
            <div className="absolute top-0 left-1/2 aspect-square h-[calc(100%-28px)] -translate-x-1/2 overflow-hidden rounded-full border border-white/95 bg-[#dff1ff] shadow-[inset_0_0_40px_rgba(255,255,255,.85),0_12px_24px_rgba(47,113,164,.13)]">
                <SnowParticles/>
                {children}
            </div>
            <div className="absolute inset-x-[12%] bottom-0 h-14 rounded-t bg-[#5c98c4] [clip-path:polygon(10%_0,90%_0,100%_100%,0_100%)]" />
        </div>
    )
}

function Sparkle({className=''}){
    return(
        <span aria-hidden="true" className={`absolute z-[3] text-white opacity-80 ${className}`}>
          ✦
        </span>
    )
}

export default function Page(){
    const weather = useApi('/api/weather', {refreshMs: 10 * 60_000}).data
    const news = useApi('/api/news', {refreshMs: 15 * 60_000}).data
    const coding = useApi('/api/coding', {refreshMs: 15 * 60_000}).data
    const device = useApi('/api/device', {refreshMs: 30_000}).data
    const stories = news?.headlines ?? headlines
    const bars = coding?.bars ?? barHeights
    const labels = coding?.labels ?? ['M', 'T', 'W', 'T', 'F', 'S', 'S']

    useEffect(() => {
        // #region agent log
        fetch('http://127.0.0.1:7632/ingest/b1d0acd6-3679-4484-bbc0-9e5a4f5aecd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7f0471'},body:JSON.stringify({sessionId:'7f0471',runId:'pre-fix',hypothesisId:'E',location:'page.jsx:Page',message:'dashboard render sources',data:{weatherTemp:weather?.temp??null,newsCount:news?.headlines?.length??null,storiesCount:stories.length,mappedList:'headlines-constant',codingHours:coding?.hours??null,codingMinutes:coding?.minutes??null,displayedTime:'24h 38m',deviceBattery:device?.battery??null,deviceCpu:device?.cpuTemp??null},timestamp:Date.now()})}).catch(()=>{});
        fetch('http://127.0.0.1:7632/ingest/b1d0acd6-3679-4484-bbc0-9e5a4f5aecd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7f0471'},body:JSON.stringify({sessionId:'7f0471',runId:'post-fix',hypothesisId:'E',location:'page.jsx:Page',message:'rendered values',data:{usingLiveNews:stories!==headlines,titles:stories.map((h)=>h.title),hours:coding?.hours??null,minutes:coding?.minutes??null,weatherTemp:weather?.temp??null,battery:device?.battery??null,cpu:device?.cpuTemp??null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
    }, [weather, news, coding, device, stories.length])

    return(
        <main className="relative min-h-screen overflow-hidden bg-[#edf5ff] px-[clapm(24px,5vw,78px)] pt-6 pb-6 max-[560px]:px-[17px] max-[560px]:py-5">
            <section aria-label="Dashboard" className={`${wrap} grid! mx-auto max-w-[960px] grid-cols-1 justify-items-center gap-8`}>
                <Snowglobe>
                    <Sparkle className="top-[70px] right-7 text-[11px]"></Sparkle>
                    <Sparkle className="top-[132px] left-[30px] text-[8px]"></Sparkle>
                    <div className="absolute right-1/2 bottom-[42px] h-[82px] w-[145px] origin-bottom translate-x-1/2 scale-[.85] rounded-[58%_58%_40%_40%] bg-[#aed6ef] opacity-75">
                        <span className="absolute -top-[43px] right-[22px] text-[97px] text-[#76b9e6] opacity-85">☼</span>
                        <span className="absolute bottom-[15px] h-[26px] w-20 rounded-[30px] bg-[#d4ecfb] shadow-[20px_-10px_0_-4px_#d4ecfb,45px_0_0_-5px_#d4ecfb]"></span>
                        <span className="absolute bottom-[37px] -left-[39px] h-[26px] w-20 scale-[.55] rounded-[30px] bg-[#d4ecfb] shadow-[20px_-10px_0_-4px_#d4ecfb,45px_0_0_-5px_#d4ecfb]"></span>
                    </div>
                    <div className="absolute inset-x-5 top-[34px] z-[2] text-center max-[560px]:inset-x-4 max-[560px]:top-[30px]">
                        <p className="mt-4 text-[58px] leading-none font-[650] tracking-[-0.5rem] text-[#1a5687]">The Weather</p>
                        <div className="mt-4 text-[58px] leading-none font-[650] tracking-[-.05em] text-[#1a5687]">
                        {weather?.temp ?? '--'}<span className="align-top text-[19px] tracking-normal text-[#5a91b7]">°C</span>
                        </div>
                        <div className="mt-[22px] flex justify-center gap-3.5 text-[10px] text-[#6e9abc]">
                            <span><b className="font-semibold text-[#3978a7]">{weather?.high ?? '--'}°</b> high</span>
                            <span><b className="font-semibold text-[#3978a7]">{weather?.low ?? '--'}°</b> low</span>
                            <span><b className="font-semibold text-[#3978a7]">{weather?.humidity ?? '--'}</b> humidity</span>
                        </div>
                    </div>
                </Snowglobe>

                <div className="mx-auto grid w-full max-w-[960px] grid-cols-2 items-stretch gap-x-0 gap-y-[19px] max-[560px]:grid-cols-1">
                    <article className={`${panel} h-full min-h-[295px] min-[561px]:rounded-r-none! min-[561px]:border-r-0`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className={heading}>What's going on?</h2>
                        </div>
                        <button className="cursor-pointer tracking-[3px]  text-[#6b9ac0]" aria-label="More news">...</button>
                    </div>
                    <div className="mt-[23px] flex flex-col">
                        {stories.map((h, i) => (
                            <a key={h.title} href={h.url ?? `#story-${i + 1}`} target={h.url ? '_blank' : undefined} rel="noreferrer" className="group block border-t border-[#dcebf6] py-">
                                <strong className="line-clamp-2 block text-sm leading-[1.3] font-medium text-[#315f87] group-hover:text-[#7fb1d8]">
                                    {h.title}
                                </strong>
                            </a>
                        ))}
                    </div>
                </article>

                <article id="activity" className={`${panel} h-full min-h-[295px] min-[561px]:rounded-l-none!`}>                    
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className={heading}>Time you locked in</h2>
                        </div>
                    </div>
                    <div className="mt-[29px] mb-[22px] flex items-baseline justify-between">
                        <strong className="text-[39px] font-semibold tracking-[-.04em] text-[#1c5888]">
                            {coding?.hours ?? '--'}<span className="text-[17px] text-[#6d9abe]">h</span> {coding?.minutes ?? '--'}<span className="text-[17px] text-[#6d9abe]">m</span>
                        </strong>
                    </div>
                    <div aria-label="coding hours by day" className="flex h-[110px] items-end gap-2.5 border-b border-[#d6e9f6]">
                        {bars.map((h, i) => (
                            <span key={i} style={{height: `${h}%`}} className={`min-h-2.5 flex-1 rounded-t-md opacity-90 ${i === 3 ? 'bg-[#5ca8d8]' : 'bg-[#68add6]'}`}></span>
                        ))}
                    </div>
                    <div className="mt-[9px] flex justify-between text-[10px] text-[#7e9fba]">
                        {labels.map((d, i) => <span key={i}>{d}</span>)}
                    </div>
                </article>

                <article className={`${panel} col-span-2 min-h-[170px] max-[560px]:col-span-1`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className={heading}>Your device</h2>
                        </div>
                    </div>
                    <div className="mt-[27px] grid grid-cols-2 gap-[30px] max-[560px]:grid-cols-1 max-[560px]:gap-5">
                        <div className="flex items-center gap-[15px]">
                            <div className="relative grid size-[43px] place-items-center rounded-[13px] bg-[#dff0fc] text-[22px] text-[#4b96c5] after:absolute after:top-[17px] after:-right-1 after:h-2.5 after:w-1 after:rounded-r-sm after:bg-[#9eb1a0] after:content-['']">
                                <span className="relative h-3 w-[21px] rounded-sm border-2 border-[#8ba18d] after:absoulte after:inset-y-0.5 after:right-1 after:left-0.5 after:bg-[#8ba18d] after:content-['']"></span>
                            </div>
                            <div>
                                <small className="text-[9px] tracking-[.13em] text-[#6f9b5]">Battery</small>
                                <strong className="my-1 block text-[28px] font-semibold text-[#245e8e]">{device?.battery ?? '--'}<span className="text-[17px] text-[#6d9abe]">%</span></strong>
                            </div>
                        </div>
                        <div className="flex items-center gap-[15px]">
                        <div className="grid size-[43px] place-items-center rounded-[13px] bg-[#dff0fc] text-[22px] text-[#4b96c5]">◒</div>
                        <div>
                            <small className="text-[9px] tracking-[.13em] text-[#6f96b5]">CPU temp</small>
                            <strong className="my-1 block text-[28px] font-semibold text-[#245e8e]">{device?.cpuTemp ?? '--'}<span className="text-[17px] text-[#6d9abe]">°C</span></strong>
                        </div>
                        </div>
                    </div>
                    </article>
                </div>
            </section>
        </main>
    )
}
