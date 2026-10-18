"""Code-native project illustrations, deliberately labelled rather than presented as screenshots."""
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'public/images/projects'
OUT.mkdir(parents=True, exist_ok=True)

def save(name, title, subtitle, bg, body):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="650" viewBox="0 0 1000 650" role="img"><title>{title}</title><desc>{subtitle}</desc><defs><filter id="shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="15" stdDeviation="15" flood-color="#1a2920" flood-opacity=".12"/></filter><linearGradient id="wash" x2="1" y2="1"><stop stop-color="{bg}"/><stop offset="1" stop-color="#f6f5ed"/></linearGradient></defs><rect width="1000" height="650" fill="url(#wash)"/><g font-family="Arial,sans-serif"><text x="55" y="60" font-size="12" letter-spacing="3" fill="#596853">PROJECT ILLUSTRATION</text><text x="55" y="105" font-size="31" fill="#243c2a">{title}</text>{body}<path d="M55 590H945" stroke="#bbc8b5"/><text x="55" y="620" font-size="13" fill="#52634b">{subtitle}</text></g></svg>'''
    (OUT / (name + '.svg')).write_text(svg,encoding='utf-8')

save('wildlife','Wildlife reporting','Mobile reporting / field observations / admin review','#dce7cc','''
<circle cx="795" cy="302" r="152" fill="#b9ce9c" opacity=".5"/>
<g filter="url(#shadow)"><rect x="410" y="175" width="505" height="335" rx="17" fill="#fffef7"/><path d="M410 220H915" stroke="#d9dfd0"/><circle cx="435" cy="198" r="5" fill="#8ba66b"/><circle cx="453" cy="198" r="5" fill="#cad5ba"/><text x="480" y="203" font-size="13" fill="#4b6143">ADMIN / INCIDENT REVIEW</text></g>
<rect x="442" y="247" width="258" height="228" rx="10" fill="#e6eddc"/><path d="M442 360Q530 285 580 375T700 320M535 247Q510 350 600 475" fill="none" stroke="#c6d4b8" stroke-width="22"/><path d="M444 428Q570 405 699 270" fill="none" stroke="#a8c5c0" stroke-width="13"/>
<g fill="#42633c" stroke="#fffef7" stroke-width="4"><circle cx="515" cy="345" r="11"/><circle cx="625" cy="300" r="11"/><circle cx="605" cy="411" r="11"/></g>
<text x="728" y="268" font-size="15" fill="#334b30">Report review</text><g fill="#e5eadc"><rect x="728" y="290" width="150" height="40" rx="7"/><rect x="728" y="343" width="150" height="40" rx="7"/><rect x="728" y="396" width="150" height="40" rx="7"/></g><g fill="#52684a" font-size="12"><text x="743" y="315">Location</text><text x="743" y="368">Observation</text><text x="743" y="421">Follow-up</text></g>
<g filter="url(#shadow)"><rect x="104" y="154" width="255" height="394" rx="37" fill="#203b2b"/><rect x="116" y="166" width="231" height="370" rx="27" fill="#fffef7"/><rect x="184" y="173" width="94" height="13" rx="7" fill="#203b2b"/></g>
<text x="142" y="226" font-size="17" fill="#203b2b">Field report</text><rect x="139" y="246" width="185" height="123" rx="10" fill="#c6d9ad"/><path d="M139 355L180 285L216 333L253 274L324 355Z" fill="#7c9a61"/><path d="M139 369L205 318L258 357L287 325L324 369Z" fill="#4b6c43"/><g fill="#dfe6d5"><rect x="140" y="390" width="180" height="12" rx="5"/><rect x="140" y="415" width="130" height="10" rx="5"/></g><rect x="140" y="455" width="182" height="44" rx="22" fill="#345838"/><text x="174" y="482" font-size="13" fill="#fff">Submit report</text>
<path d="M362 364H402M391 353L403 364L391 375" fill="none" stroke="#76965e" stroke-width="3"/>
''')

save('orchid','Orchid refrigerator store','E-commerce concept / refrigerator catalog / cart and checkout','#dfe8e8','''
<g filter="url(#shadow)"><rect x="85" y="160" width="830" height="382" rx="15" fill="#fffefa"/></g><path d="M85 208H915" stroke="#d6dfe0"/><text x="116" y="191" font-family="Georgia,serif" font-size="20" fill="#304d52">Orchid</text><text x="648" y="190" font-size="12" fill="#577076">Refrigerators ? Product details ? Cart</text>
<rect x="110" y="230" width="780" height="209" rx="8" fill="#e5eded"/><text x="145" y="292" font-family="Georgia,serif" font-size="34" fill="#304d52">Find the right fridge.</text><text x="145" y="328" font-size="15" fill="#577076">Explore the refrigerator collection.</text><rect x="145" y="360" width="165" height="40" rx="20" fill="#385d61"/><text x="167" y="386" font-size="12" fill="#fff">Browse refrigerators</text>
<g filter="url(#shadow)"><rect x="662" y="246" width="108" height="171" rx="9" fill="#c4cfd1" stroke="#9cafb2"/><rect x="670" y="254" width="92" height="54" rx="4" fill="#e4ebec"/><rect x="670" y="316" width="92" height="93" rx="4" fill="#e4ebec"/><path d="M681 274V292M681 334V361" stroke="#82989c" stroke-width="5" stroke-linecap="round"/>
<rect x="786" y="270" width="77" height="147" rx="8" fill="#b1c3c8" stroke="#8fa6ad"/><path d="M824 276V410" stroke="#829fa5" stroke-width="2"/><path d="M814 318V345M835 318V345" stroke="#627f87" stroke-width="4" stroke-linecap="round"/></g>
<g fill="#edf1ee"><rect x="111" y="458" width="246" height="57" rx="6"/><rect x="377" y="458" width="246" height="57" rx="6"/><rect x="643" y="458" width="246" height="57" rx="6"/></g><g fill="#526e6e" font-size="13"><text x="137" y="493">Browse models</text><text x="403" y="493">View product details</text><text x="669" y="493">Add to cart</text></g>
''')

save('dashboard','Screen time and daily habits','Analysis concept / phone use / habits and wellbeing','#dce8ed','''
<g filter="url(#shadow)"><rect x="100" y="168" width="236" height="364" rx="34" fill="#314c5b"/><rect x="112" y="180" width="212" height="340" rx="25" fill="#f8fbfa"/></g><rect x="178" y="187" width="80" height="10" rx="5" fill="#314c5b"/><text x="141" y="238" font-size="16" fill="#314c5b">Daily habits</text>
<circle cx="219" cy="330" r="60" fill="none" stroke="#e1e9e9" stroke-width="17"/><path d="M219 270A60 60 0 1 1 162 349" fill="none" stroke="#77a6ac" stroke-width="17" stroke-linecap="round"/><path d="M202 330L215 344L239 316" fill="none" stroke="#547886" stroke-width="5"/><rect x="143" y="423" width="150" height="13" rx="5" fill="#d5e3e4"/><rect x="143" y="450" width="114" height="10" rx="5" fill="#d5e3e4"/>
<g filter="url(#shadow)"><rect x="395" y="184" width="500" height="330" rx="15" fill="#fffef8"/></g><text x="431" y="230" font-size="18" fill="#314c5b">Exploring patterns</text><path d="M445 277V430H850" fill="none" stroke="#b6cacf" stroke-width="2"/><path d="M445 315H850M445 354H850M445 393H850" stroke="#e2ebeb"/><path d="M463 395C520 410 530 323 587 350S659 282 703 310S780 270 833 282" fill="none" stroke="#6a99a1" stroke-width="5" stroke-linecap="round"/><g fill="#b4cfd1"><circle cx="487" cy="316" r="6"/><circle cx="556" cy="385" r="6"/><circle cx="644" cy="337" r="6"/><circle cx="757" cy="355" r="6"/><circle cx="817" cy="322" r="6"/></g><text x="431" y="479" font-size="12" fill="#657e87">ILLUSTRATIVE PATTERNS / NO MEASURED RESULTS</text>
''')

save('process','From event logs to workflows','Process mining concept / workflow mapping / bottleneck exploration','#e2e4f0','''
<g filter="url(#shadow)"><rect x="75" y="179" width="850" height="353" rx="17" fill="#fffefa"/></g><text x="112" y="224" font-size="17" fill="#4b4a70">Workflow explorer</text><g fill="none" stroke="#b0abd0" stroke-width="4"><path d="M222 355H340M475 355H590M725 355H815"/><path d="M650 315V266H408V315" stroke-dasharray="7 7"/></g>
<circle cx="182" cy="355" r="39" fill="#d9e7d2"/><path d="M171 355L180 365L197 344" fill="none" stroke="#648258" stroke-width="4"/>
<rect x="340" y="314" width="135" height="82" rx="13" fill="#e6e3f3"/><rect x="590" y="314" width="135" height="82" rx="13" fill="#d7d2ec"/><circle cx="847" cy="355" r="31" fill="#535071"/><circle cx="847" cy="355" r="12" fill="#f5f2ff"/>
<g fill="#4b4a70" font-size="15" text-anchor="middle"><text x="182" y="432">Event log</text><text x="408" y="361">Review</text><text x="658" y="361">Process</text><text x="847" y="432">Complete</text></g><text x="483" y="254" font-size="12" fill="#787199">Revisit a step</text><path d="M111 467H887" stroke="#e2e0ec"/><text x="112" y="500" font-size="12" fill="#77728a">Map the path. Investigate where the work slows down.</text>
''')

points=''
for cx,cy,color in [(300,350,'#668e8d'),(530,260,'#9484af'),(690,407,'#c49c73')]:
    points+=f'<ellipse cx="{cx}" cy="{cy}" rx="112" ry="80" fill="{color}" opacity=".09"/>'
    for i in range(17):
        x=cx+((i*43)%159)-79;y=cy+((i*31)%101)-50
        points+=f'<circle cx="{x}" cy="{y}" r="{5+i%3}" fill="{color}" opacity=".78"/>'
save('scatter','Understanding customer groups','Segmentation concept / clustering / exploring shared characteristics','#e9e2e9',f'''
<g filter="url(#shadow)"><rect x="90" y="165" width="820" height="375" rx="17" fill="#fffef9"/></g><text x="125" y="210" font-size="17" fill="#504a5e">Cluster exploration</text><path d="M150 246V485H850" fill="none" stroke="#d3cdd6" stroke-width="2"/>{points}<g font-size="12" fill="#625d6d"><circle cx="577" cy="205" r="5" fill="#668e8d"/><text x="590" y="210">Group A</text><circle cx="677" cy="205" r="5" fill="#9484af"/><text x="690" y="210">Group B</text><circle cx="777" cy="205" r="5" fill="#c49c73"/><text x="790" y="210">Group C</text></g><text x="480" y="520" font-size="11" fill="#827c89">ILLUSTRATIVE CLUSTERS / NO CUSTOMER DATA</text>
''')

save('inventory','Application architecture','Software project / interface / application logic / storage','#dfe8d7','''
<g stroke="#abc09c" stroke-width="4"><path d="M300 350H420M580 350H700"/></g><g filter="url(#shadow)"><rect x="100" y="255" width="200" height="190" rx="18" fill="#fffef8"/><rect x="420" y="255" width="160" height="190" rx="18" fill="#f1f5e9"/><rect x="700" y="255" width="200" height="190" rx="18" fill="#fffef8"/></g><g text-anchor="middle" fill="#3b5933"><text x="200" y="325" font-size="42">&lt;/&gt;</text><text x="500" y="325" font-size="38">{ }</text><text x="800" y="325" font-size="38">SQL</text><text x="200" y="389" font-size="16">Interface</text><text x="500" y="389" font-size="16">Logic</text><text x="800" y="389" font-size="16">Storage</text></g>
''')
print('Created six project illustration assets.')
