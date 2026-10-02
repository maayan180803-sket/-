"""Builds a single self-contained Hebrew HTML course from the markdown files."""
import re, html, pathlib, markdown

root = pathlib.Path(__file__).parent
order = ["README", "00-start-here", "01-foundations", "02-prompt-anatomy", "03-camera-motion",
         "04-references", "05-audio-dialogue", "06-multishot-storyboard", "07-pro-workflow",
         "08-capstone", "glossary", "cheatsheet", "troubleshooting"]
names = {"README": "דף הבית", "glossary": "מילון מונחים", "cheatsheet": "דף עזר מהיר",
         "troubleshooting": "פתרון תקלות"}

sections, nav = [], []
for key in order:
    text = (root / f"{key}.md").read_text(encoding="utf-8")
    title = re.search(r"^# (.+)$", text, re.M).group(1)
    # python-markdown needs a blank line before a list
    lines, fixed, fence = text.split("\n"), [], False
    for i, ln in enumerate(lines):
        if ln.strip().startswith("```"):
            fence = not fence
        is_item = re.match(r"\s*([-*]|\d+\.)\s", ln) and not fence
        if is_item and fixed and fixed[-1].strip() and not re.match(r"\s*([-*]|\d+\.)\s", fixed[-1]) and not fixed[-1].lstrip().startswith("|"):
            fixed.append("")
        fixed.append(ln)
    text = "\n".join(fixed)
    # internal .md links -> in-page anchors
    text = re.sub(r"\]\(([\w-]+)\.md\)", lambda m: f"](#{m.group(1)})", text)
    body = markdown.markdown(text, extensions=["tables", "fenced_code"])
    # turn "- [ ]" checklist items into real checkboxes
    body = body.replace("<li>[ ] ", '<li class="chk"><input type="checkbox"> ')
    # code blocks get a copy button wrapper
    body = re.sub(r"<pre><code>", '<div class="code"><button class="copy">העתק</button><pre><code dir="ltr">', body)
    body = body.replace("</code></pre>", "</code></pre></div>")
    label = names.get(key, title)
    sections.append(f'<section id="{key}" class="lesson">{body}'
                    f'<div class="done"><label><input type="checkbox" data-done="{key}"> סיימתי את השיעור הזה</label></div></section>')
    nav.append(f'<a href="#{key}" data-k="{key}">{html.escape(label)}</a>')

page = f"""<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>קורס Seedance למתחילים</title>
<style>
:root{{--bg:#fafaf7;--fg:#1d1d1f;--mut:#666;--card:#fff;--line:#e3e1da;--acc:#5b4bdb;--accbg:#efedff;--code:#f4f2ec}}
@media (prefers-color-scheme:dark){{:root{{--bg:#16161a;--fg:#ececf0;--mut:#9a9aa6;--card:#1f1f25;--line:#34343d;--acc:#9c8fff;--accbg:#2a2745;--code:#101014}}}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--fg);font:17px/1.75 system-ui,"Segoe UI",Arial,sans-serif}}
.layout{{display:flex;min-height:100vh}}
nav{{width:270px;flex-shrink:0;position:sticky;top:0;height:100vh;overflow:auto;padding:20px 16px;border-inline-end:1px solid var(--line);background:var(--card)}}
nav h2{{font-size:18px;margin:0 0 4px}}
nav .bar{{height:8px;background:var(--line);border-radius:6px;margin:8px 0 16px;overflow:hidden}}
nav .bar i{{display:block;height:100%;width:0;background:var(--acc);transition:width .3s}}
nav a{{display:block;padding:8px 10px;border-radius:8px;color:var(--fg);text-decoration:none;font-size:15px}}
nav a:hover{{background:var(--accbg)}}
nav a.active{{background:var(--accbg);color:var(--acc);font-weight:600}}
nav a.ok::after{{content:" ✓";color:#2e9e5b}}
main{{flex:1;max-width:860px;margin:0 auto;padding:28px 24px 80px}}
.lesson{{display:none}}
.lesson.show{{display:block}}
h1{{font-size:30px;line-height:1.3;margin-top:0}}
h2{{margin-top:2em;border-bottom:2px solid var(--line);padding-bottom:6px}}
h3{{margin-top:1.6em;color:var(--acc)}}
table{{border-collapse:collapse;width:100%;margin:16px 0;font-size:15px;display:block;overflow-x:auto}}
th,td{{border:1px solid var(--line);padding:8px 10px;text-align:right;vertical-align:top}}
th{{background:var(--accbg)}}
blockquote{{margin:16px 0;padding:10px 16px;border-inline-start:4px solid var(--acc);background:var(--accbg);border-radius:6px}}
blockquote p{{margin:4px 0}}
code{{background:var(--code);padding:1px 6px;border-radius:5px;font-size:.92em;direction:ltr;unicode-bidi:embed}}
.code{{position:relative;margin:14px 0}}
.code pre{{margin:0;background:var(--code);border:1px solid var(--line);border-radius:10px;padding:16px;overflow-x:auto;direction:ltr;text-align:left}}
.code pre code{{background:none;padding:0;white-space:pre-wrap}}
.copy{{position:absolute;top:8px;inset-inline-end:8px;border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:6px;padding:3px 10px;cursor:pointer;font-size:13px}}
li.chk{{list-style:none;margin-inline-start:-20px}}
.done{{margin-top:40px;padding:14px;border:1px dashed var(--acc);border-radius:10px;background:var(--accbg)}}
.pager{{display:flex;justify-content:space-between;margin-top:24px;gap:12px}}
.pager button{{padding:10px 18px;border-radius:8px;border:1px solid var(--acc);background:var(--card);color:var(--acc);cursor:pointer;font-size:15px}}
.pager button:disabled{{opacity:.35;cursor:default}}
#menu{{display:none}}
@media (max-width:820px){{
 nav{{position:fixed;inset-block:0;inset-inline-start:0;transform:translateX(100%);transition:transform .25s;z-index:10;width:80%}}
 nav.open{{transform:none}}
 #menu{{display:block;position:sticky;top:0;z-index:5;width:100%;padding:12px;background:var(--card);border:0;border-bottom:1px solid var(--line);font-size:16px;color:var(--fg)}}
 main{{padding:20px 16px 60px}}
}}
@media print{{nav,#menu,.pager,.done,.copy{{display:none}}.lesson{{display:block!important;page-break-after:always}}}}
</style>
</head>
<body>
<button id="menu">☰ תפריט השיעורים</button>
<div class="layout">
<nav id="nav"><h2>קורס Seedance</h2><div class="bar"><i id="bar"></i></div><div id="pct" style="font-size:13px;color:var(--mut)"></div>
{''.join(nav)}</nav>
<main>
{''.join(sections)}
<div class="pager"><button id="next">השיעור הבא ←</button><button id="prev">→ השיעור הקודם</button></div>
</main>
</div>
<script>
const keys={order!r};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let done={{}};
try{{done=JSON.parse(localStorage.getItem('seedance-done')||'{{}}')}}catch(e){{}}
function save(){{try{{localStorage.setItem('seedance-done',JSON.stringify(done))}}catch(e){{}}}}
function show(k){{
  if(!keys.includes(k))k=keys[0];
  $$('.lesson').forEach(s=>s.classList.toggle('show',s.id===k));
  $$('nav a').forEach(a=>a.classList.toggle('active',a.dataset.k===k));
  const i=keys.indexOf(k);
  $('#prev').disabled=i===0;$('#next').disabled=i===keys.length-1;
  $('#nav').classList.remove('open');window.scrollTo(0,0);
}}
function refresh(){{
  const n=keys.filter(k=>done[k]).length;
  $('#bar').style.width=(100*n/keys.length)+'%';
  $('#pct').textContent=n+' מתוך '+keys.length+' הושלמו';
  $$('nav a').forEach(a=>a.classList.toggle('ok',!!done[a.dataset.k]));
  $$('[data-done]').forEach(c=>c.checked=!!done[c.dataset.done]);
}}
$$('[data-done]').forEach(c=>c.onchange=()=>{{done[c.dataset.done]=c.checked;save();refresh()}});
$$('.copy').forEach(b=>b.onclick=()=>{{
  const t=b.parentElement.querySelector('code').innerText;
  (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>{{b.textContent='הועתק ✓'}},()=>{{b.textContent='סמנו והעתיקו ידנית'}});
  setTimeout(()=>b.textContent='העתק',1500);
}});
function cur(){{return location.hash.slice(1)||keys[0]}}
$('#next').onclick=()=>location.hash=keys[Math.min(keys.indexOf(cur())+1,keys.length-1)];
$('#prev').onclick=()=>location.hash=keys[Math.max(keys.indexOf(cur())-1,0)];
$('#menu').onclick=()=>$('#nav').classList.toggle('open');
addEventListener('hashchange',()=>show(cur()));
show(cur());refresh();
</script>
</body></html>"""
out = root / "seedance-course.html"
out.write_text(page, encoding="utf-8")
print(out, len(page))
