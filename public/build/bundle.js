
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\Tailwindcss.svelte generated by Svelte v3.31.2 */

    function create_fragment(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tailwindcss", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tailwindcss> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Tailwindcss extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tailwindcss",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\components\_buttons\Button.svelte generated by Svelte v3.31.2 */

    const file = "src\\components\\_buttons\\Button.svelte";

    function create_fragment$1(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "id", /*id*/ ctx[0]);
    			attr_dev(button, "class", "font-semibold uppercase text-sm font-sans p-2 rounded outline-none focus:outline-none mb-0");
    			attr_dev(button, "type", "button");
    			set_style(button, "transition", "all .15s ease");
    			toggle_class(button, "btn-blue", /*color*/ ctx[1] === "blue");
    			toggle_class(button, "btn-red", /*color*/ ctx[1] === "red");
    			toggle_class(button, "btn-yellow", /*color*/ ctx[1] === "yellow");
    			toggle_class(button, "px-4", !/*hasIcon*/ ctx[2]);
    			add_location(button, file, 6, 0, 126);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*id*/ 1) {
    				attr_dev(button, "id", /*id*/ ctx[0]);
    			}

    			if (dirty & /*color*/ 2) {
    				toggle_class(button, "btn-blue", /*color*/ ctx[1] === "blue");
    			}

    			if (dirty & /*color*/ 2) {
    				toggle_class(button, "btn-red", /*color*/ ctx[1] === "red");
    			}

    			if (dirty & /*color*/ 2) {
    				toggle_class(button, "btn-yellow", /*color*/ ctx[1] === "yellow");
    			}

    			if (dirty & /*hasIcon*/ 4) {
    				toggle_class(button, "px-4", !/*hasIcon*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	let { id } = $$props;
    	let { color = "" } = $$props;
    	let { hasIcon = false } = $$props;
    	const writable_props = ["id", "color", "hasIcon"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("hasIcon" in $$props) $$invalidate(2, hasIcon = $$props.hasIcon);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ id, color, hasIcon });

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("hasIcon" in $$props) $$invalidate(2, hasIcon = $$props.hasIcon);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [id, color, hasIcon, $$scope, slots, click_handler];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { id: 0, color: 1, hasIcon: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<Button> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasIcon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasIcon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\_nav\SideBar.svelte generated by Svelte v3.31.2 */

    const file$1 = "src\\components\\_nav\\SideBar.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (29:4) {:else}
    function create_else_block_1(ctx) {
    	let li;
    	let div0;
    	let t1;
    	let div1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			div0 = element("div");
    			div0.textContent = "Loading...";
    			t1 = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "text-gray-700 dark:text-gray-300 text-sm uppercase font-semibold tracking-wide block pb-2 no-underline tr-200");
    			add_location(div0, file$1, 30, 8, 1080);
    			attr_dev(div1, "class", "linear-background h-6 mx-4");
    			add_location(div1, file$1, 34, 8, 1262);
    			attr_dev(li, "class", "my-px");
    			add_location(li, file$1, 29, 6, 1052);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div0);
    			append_dev(li, t1);
    			append_dev(li, div1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(29:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (10:4) {#if navItems[0] != undefined}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let each_value = /*navItems*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navItems, active*/ 3) {
    				each_value = /*navItems*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(10:4) {#if navItems[0] != undefined}",
    		ctx
    	});

    	return block;
    }

    // (18:10) {:else}
    function create_else_block(ctx) {
    	let a;
    	let t_value = /*item*/ ctx[5].text + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*i*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", null);
    			attr_dev(a, "class", "text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 text-sm block mb-2 no-underline cursor-pointer tr-200 uppercase pl-2 select-none leading-none tracking-wider link");
    			toggle_class(a, "active", /*active*/ ctx[0] === /*i*/ ctx[7]);
    			add_location(a, file$1, 18, 12, 626);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*navItems*/ 2 && t_value !== (t_value = /*item*/ ctx[5].text + "")) set_data_dev(t, t_value);

    			if (dirty & /*active*/ 1) {
    				toggle_class(a, "active", /*active*/ ctx[0] === /*i*/ ctx[7]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(18:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (13:10) {#if item.type === 'heading'}
    function create_if_block_1(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[5].text + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "text-gray-700 dark:text-gray-300 text-sm uppercase font-semibold tracking-wider block pb-2 no-underline tr-200 select-none");
    			add_location(span, file$1, 13, 12, 393);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navItems*/ 2 && t_value !== (t_value = /*item*/ ctx[5].text + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(13:10) {#if item.type === 'heading'}",
    		ctx
    	});

    	return block;
    }

    // (11:6) {#each navItems as item, i}
    function create_each_block(ctx) {
    	let li;
    	let t;

    	function select_block_type_1(ctx, dirty) {
    		if (/*item*/ ctx[5].type === "heading") return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if_block.c();
    			t = space();
    			attr_dev(li, "class", "my-px");
    			add_location(li, file$1, 11, 8, 320);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			if_block.m(li, null);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(li, t);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(11:6) {#each navItems as item, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let nav;
    	let div2;
    	let div0;
    	let ul;
    	let t;
    	let div1;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*navItems*/ ctx[1][0] != undefined) return create_if_block;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div2 = element("div");
    			div0 = element("div");
    			ul = element("ul");
    			if_block.c();
    			t = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			add_location(ul, file$1, 8, 2, 235);
    			attr_dev(div0, "class", "flex-1");
    			add_location(div0, file$1, 7, 2, 211);
    			attr_dev(div1, "class", "h-12 hidden md:block");
    			add_location(div1, file$1, 39, 2, 1351);
    			attr_dev(div2, "class", "flex flex-col h-full");
    			add_location(div2, file$1, 6, 0, 173);
    			attr_dev(nav, "class", "h-12 md:h-full overflow-y-auto md:px-12 md:pt-12 ");
    			add_location(nav, file$1, 5, 0, 108);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div2);
    			append_dev(div2, div0);
    			append_dev(div0, ul);
    			if_block.m(ul, null);
    			append_dev(div2, t);
    			append_dev(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(ul, null);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if_block.d();
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SideBar", slots, ['default']);
    	let { active = 1 } = $$props;
    	let { navItems = [] } = $$props;
    	const writable_props = ["active", "navItems"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SideBar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => $$invalidate(0, active = i);

    	$$self.$$set = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("navItems" in $$props) $$invalidate(1, navItems = $$props.navItems);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ active, navItems });

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("navItems" in $$props) $$invalidate(1, navItems = $$props.navItems);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [active, navItems, $$scope, slots, click_handler];
    }

    class SideBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { active: 0, navItems: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SideBar",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get active() {
    		throw new Error("<SideBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<SideBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get navItems() {
    		throw new Error("<SideBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set navItems(value) {
    		throw new Error("<SideBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\_nav\Sbar.svelte generated by Svelte v3.31.2 */

    const file$2 = "src\\components\\_nav\\Sbar.svelte";
    const get_header_slot_changes = dirty => ({});
    const get_header_slot_context = ctx => ({});

    function create_fragment$3(ctx) {
    	let div5;
    	let div4;
    	let a0;
    	let t0;
    	let div2;
    	let div0;
    	let a1;
    	let svg0;
    	let path0;
    	let t1;
    	let span0;
    	let t3;
    	let a2;
    	let svg1;
    	let path1;
    	let t4;
    	let span1;
    	let t6;
    	let a3;
    	let svg2;
    	let path2;
    	let t7;
    	let span2;
    	let t9;
    	let a4;
    	let svg3;
    	let path3;
    	let t10;
    	let span3;
    	let t12;
    	let div1;
    	let a5;
    	let svg4;
    	let path4;
    	let t13;
    	let span4;
    	let t15;
    	let a6;
    	let svg5;
    	let path5;
    	let t16;
    	let span5;
    	let t18;
    	let a7;
    	let svg6;
    	let path6;
    	let t19;
    	let span6;
    	let t21;
    	let span7;
    	let t22;
    	let div3;
    	let t23;
    	let a8;
    	let svg7;
    	let path7;
    	let t24;
    	let span8;
    	let current;
    	const header_slot_template = /*#slots*/ ctx[2].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[1], get_header_slot_context);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			a0 = element("a");
    			if (header_slot) header_slot.c();
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			a1 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t1 = space();
    			span0 = element("span");
    			span0.textContent = "Dasboard";
    			t3 = space();
    			a2 = element("a");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t4 = space();
    			span1 = element("span");
    			span1.textContent = "Search";
    			t6 = space();
    			a3 = element("a");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t7 = space();
    			span2 = element("span");
    			span2.textContent = "Insights";
    			t9 = space();
    			a4 = element("a");
    			svg3 = svg_element("svg");
    			path3 = svg_element("path");
    			t10 = space();
    			span3 = element("span");
    			span3.textContent = "Docs";
    			t12 = space();
    			div1 = element("div");
    			a5 = element("a");
    			svg4 = svg_element("svg");
    			path4 = svg_element("path");
    			t13 = space();
    			span4 = element("span");
    			span4.textContent = "Products";
    			t15 = space();
    			a6 = element("a");
    			svg5 = svg_element("svg");
    			path5 = svg_element("path");
    			t16 = space();
    			span5 = element("span");
    			span5.textContent = "Settings";
    			t18 = space();
    			a7 = element("a");
    			svg6 = svg_element("svg");
    			path6 = svg_element("path");
    			t19 = space();
    			span6 = element("span");
    			span6.textContent = "Messages";
    			t21 = space();
    			span7 = element("span");
    			t22 = space();
    			div3 = element("div");
    			t23 = space();
    			a8 = element("a");
    			svg7 = svg_element("svg");
    			path7 = svg_element("path");
    			t24 = space();
    			span8 = element("span");
    			span8.textContent = "Account";
    			attr_dev(a0, "class", "flex items-center w-full px-4 mt-3");
    			attr_dev(a0, "href", null);
    			add_location(a0, file$2, 8, 4, 270);
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "stroke-width", "2");
    			attr_dev(path0, "d", "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6");
    			add_location(path0, file$2, 21, 12, 825);
    			attr_dev(svg0, "class", "w-6 h-6 stroke-current");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "stroke", "currentColor");
    			add_location(svg0, file$2, 15, 10, 621);
    			attr_dev(span0, "class", "ml-2 text-sm font-medium");
    			add_location(span0, file$2, 28, 10, 1149);
    			attr_dev(a1, "class", "flex items-center w-full h-12 px-3 mt-2 rounded hover:bg-gray-700 hover:text-gray-300");
    			attr_dev(a1, "href", null);
    			add_location(a1, file$2, 14, 8, 500);
    			attr_dev(path1, "stroke-linecap", "round");
    			attr_dev(path1, "stroke-linejoin", "round");
    			attr_dev(path1, "stroke-width", "2");
    			attr_dev(path1, "d", "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z");
    			add_location(path1, file$2, 37, 12, 1552);
    			attr_dev(svg1, "class", "w-6 h-6 stroke-current");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "stroke", "currentColor");
    			add_location(svg1, file$2, 31, 10, 1348);
    			attr_dev(span1, "class", "ml-2 text-sm font-medium");
    			add_location(span1, file$2, 44, 10, 1775);
    			attr_dev(a2, "class", "flex items-center w-full h-12 px-3 mt-2 rounded hover:bg-gray-700 hover:text-gray-300");
    			attr_dev(a2, "href", null);
    			add_location(a2, file$2, 30, 8, 1227);
    			attr_dev(path2, "stroke-linecap", "round");
    			attr_dev(path2, "stroke-linejoin", "round");
    			attr_dev(path2, "stroke-width", "2");
    			attr_dev(path2, "d", "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z");
    			add_location(path2, file$2, 53, 12, 2164);
    			attr_dev(svg2, "class", "w-6 h-6 stroke-current");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			attr_dev(svg2, "stroke", "currentColor");
    			add_location(svg2, file$2, 47, 10, 1960);
    			attr_dev(span2, "class", "ml-2 text-sm font-medium");
    			add_location(span2, file$2, 60, 10, 2431);
    			attr_dev(a3, "class", "flex items-center w-full h-12 px-3 mt-2 text-gray-200 bg-gray-700 rounded");
    			attr_dev(a3, "href", null);
    			add_location(a3, file$2, 46, 8, 1851);
    			attr_dev(path3, "stroke-linecap", "round");
    			attr_dev(path3, "stroke-linejoin", "round");
    			attr_dev(path3, "stroke-width", "2");
    			attr_dev(path3, "d", "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2");
    			add_location(path3, file$2, 69, 12, 2834);
    			attr_dev(svg3, "class", "w-6 h-6 stroke-current");
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg3, "fill", "none");
    			attr_dev(svg3, "viewBox", "0 0 24 24");
    			attr_dev(svg3, "stroke", "currentColor");
    			add_location(svg3, file$2, 63, 10, 2630);
    			attr_dev(span3, "class", "ml-2 text-sm font-medium");
    			add_location(span3, file$2, 76, 10, 3174);
    			attr_dev(a4, "class", "flex items-center w-full h-12 px-3 mt-2 rounded hover:bg-gray-700 hover:text-gray-300");
    			attr_dev(a4, "href", null);
    			add_location(a4, file$2, 62, 8, 2509);
    			attr_dev(div0, "class", "flex flex-col items-center w-full mt-3 border-t border-gray-700");
    			add_location(div0, file$2, 13, 6, 413);
    			attr_dev(path4, "stroke-linecap", "round");
    			attr_dev(path4, "stroke-linejoin", "round");
    			attr_dev(path4, "stroke-width", "2");
    			attr_dev(path4, "d", "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z");
    			add_location(path4, file$2, 87, 12, 3672);
    			attr_dev(svg4, "class", "w-6 h-6 stroke-current");
    			attr_dev(svg4, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg4, "fill", "none");
    			attr_dev(svg4, "viewBox", "0 0 24 24");
    			attr_dev(svg4, "stroke", "currentColor");
    			add_location(svg4, file$2, 81, 10, 3468);
    			attr_dev(span4, "class", "ml-2 text-sm font-medium");
    			add_location(span4, file$2, 94, 10, 4000);
    			attr_dev(a5, "class", "flex items-center w-full h-12 px-3 mt-2 rounded hover:bg-gray-700 hover:text-gray-300");
    			attr_dev(a5, "href", null);
    			add_location(a5, file$2, 80, 8, 3347);
    			attr_dev(path5, "stroke-linecap", "round");
    			attr_dev(path5, "stroke-linejoin", "round");
    			attr_dev(path5, "stroke-width", "2");
    			attr_dev(path5, "d", "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4");
    			add_location(path5, file$2, 103, 12, 4403);
    			attr_dev(svg5, "class", "w-6 h-6 stroke-current");
    			attr_dev(svg5, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg5, "fill", "none");
    			attr_dev(svg5, "viewBox", "0 0 24 24");
    			attr_dev(svg5, "stroke", "currentColor");
    			add_location(svg5, file$2, 97, 10, 4199);
    			attr_dev(span5, "class", "ml-2 text-sm font-medium");
    			add_location(span5, file$2, 110, 10, 4718);
    			attr_dev(a6, "class", "flex items-center w-full h-12 px-3 mt-2 rounded hover:bg-gray-700 hover:text-gray-300");
    			attr_dev(a6, "href", null);
    			add_location(a6, file$2, 96, 8, 4078);
    			attr_dev(path6, "stroke-linecap", "round");
    			attr_dev(path6, "stroke-linejoin", "round");
    			attr_dev(path6, "stroke-width", "2");
    			attr_dev(path6, "d", "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z");
    			add_location(path6, file$2, 121, 12, 5152);
    			attr_dev(svg6, "class", "w-6 h-6 stroke-current");
    			attr_dev(svg6, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg6, "fill", "none");
    			attr_dev(svg6, "viewBox", "0 0 24 24");
    			attr_dev(svg6, "stroke", "currentColor");
    			add_location(svg6, file$2, 115, 10, 4948);
    			attr_dev(span6, "class", "ml-2 text-sm font-medium");
    			add_location(span6, file$2, 128, 10, 5423);
    			attr_dev(span7, "class", "absolute top-0 left-0 w-2 h-2 mt-2 ml-2 bg-indigo-500 rounded-full");
    			add_location(span7, file$2, 129, 10, 5489);
    			attr_dev(a7, "class", "relative flex items-center w-full h-12 px-3 mt-2 rounded hover:bg-gray-700 hover:text-gray-300");
    			attr_dev(a7, "href", null);
    			add_location(a7, file$2, 112, 8, 4796);
    			attr_dev(div1, "class", "flex flex-col items-center w-full mt-2 border-t border-gray-700");
    			add_location(div1, file$2, 79, 6, 3260);
    			attr_dev(div2, "class", "w-full px-4");
    			add_location(div2, file$2, 12, 4, 380);
    			attr_dev(div3, "class", "flex-grow");
    			add_location(div3, file$2, 133, 4, 5618);
    			attr_dev(path7, "stroke-linecap", "round");
    			attr_dev(path7, "stroke-linejoin", "round");
    			attr_dev(path7, "stroke-width", "2");
    			attr_dev(path7, "d", "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z");
    			add_location(path7, file$2, 143, 8, 5977);
    			attr_dev(svg7, "class", "w-6 h-6 stroke-current");
    			attr_dev(svg7, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg7, "fill", "none");
    			attr_dev(svg7, "viewBox", "0 0 24 24");
    			attr_dev(svg7, "stroke", "currentColor");
    			add_location(svg7, file$2, 137, 6, 5797);
    			attr_dev(span8, "class", "ml-2 text-sm font-medium");
    			add_location(span8, file$2, 150, 6, 6258);
    			attr_dev(a8, "class", "flex items-center justify-center w-full h-16 mt-auto bg-gray-800 hover:bg-gray-700 hover:text-gray-300");
    			attr_dev(a8, "href", null);
    			add_location(a8, file$2, 134, 4, 5649);
    			attr_dev(div4, "class", "flex flex-col items-stretch justify-start w-64 overflow-hidden text-gray-400 bg-gray-900 rounded-md h-full border");
    			add_location(div4, file$2, 5, 2, 110);
    			attr_dev(div5, "class", "p-2 h-full");
    			add_location(div5, file$2, 4, 0, 82);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, a0);

    			if (header_slot) {
    				header_slot.m(a0, null);
    			}

    			append_dev(div4, t0);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div0, a1);
    			append_dev(a1, svg0);
    			append_dev(svg0, path0);
    			append_dev(a1, t1);
    			append_dev(a1, span0);
    			append_dev(div0, t3);
    			append_dev(div0, a2);
    			append_dev(a2, svg1);
    			append_dev(svg1, path1);
    			append_dev(a2, t4);
    			append_dev(a2, span1);
    			append_dev(div0, t6);
    			append_dev(div0, a3);
    			append_dev(a3, svg2);
    			append_dev(svg2, path2);
    			append_dev(a3, t7);
    			append_dev(a3, span2);
    			append_dev(div0, t9);
    			append_dev(div0, a4);
    			append_dev(a4, svg3);
    			append_dev(svg3, path3);
    			append_dev(a4, t10);
    			append_dev(a4, span3);
    			append_dev(div2, t12);
    			append_dev(div2, div1);
    			append_dev(div1, a5);
    			append_dev(a5, svg4);
    			append_dev(svg4, path4);
    			append_dev(a5, t13);
    			append_dev(a5, span4);
    			append_dev(div1, t15);
    			append_dev(div1, a6);
    			append_dev(a6, svg5);
    			append_dev(svg5, path5);
    			append_dev(a6, t16);
    			append_dev(a6, span5);
    			append_dev(div1, t18);
    			append_dev(div1, a7);
    			append_dev(a7, svg6);
    			append_dev(svg6, path6);
    			append_dev(a7, t19);
    			append_dev(a7, span6);
    			append_dev(a7, t21);
    			append_dev(a7, span7);
    			append_dev(div4, t22);
    			append_dev(div4, div3);
    			append_dev(div4, t23);
    			append_dev(div4, a8);
    			append_dev(a8, svg7);
    			append_dev(svg7, path7);
    			append_dev(a8, t24);
    			append_dev(a8, span8);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (header_slot) {
    				if (header_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(header_slot, header_slot_template, ctx, /*$$scope*/ ctx[1], dirty, get_header_slot_changes, get_header_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if (header_slot) header_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Sbar", slots, ['header']);
    	let { active = "" } = $$props;
    	const writable_props = ["active"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ active });

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [active, $$scope, slots];
    }

    class Sbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { active: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sbar",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get active() {
    		throw new Error("<Sbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Sbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function handleFirstTab(e) {
        if (e.keyCode === 9) {
            document.body.classList.add('user-is-tabbing');
            window.removeEventListener('keydown', handleFirstTab);
            window.addEventListener('mousedown', handleMouseDownOnce);
        }
    }
    function handleMouseDownOnce() {
        document.body.classList.remove('user-is-tabbing');
        window.removeEventListener('mousedown', handleMouseDownOnce);
        window.addEventListener('keydown', handleFirstTab);
    }

    /* src\components\_tab_manager\TabManager.svelte generated by Svelte v3.31.2 */

    function create_fragment$4(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TabManager", slots, []);

    	onMount(() => {
    		window.addEventListener("keydown", handleFirstTab);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TabManager> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ handleFirstTab, onMount });
    	return [];
    }

    class TabManager extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabManager",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const storedTheme = localStorage.getItem("theme");

    const theme = writable(storedTheme);
    theme.subscribe(value => {
        localStorage.setItem("theme", value === 'dark' ? 'dark' : 'light');
    });

    /* src\components\_theme-toggle\ThemeToggle.svelte generated by Svelte v3.31.2 */
    const file$3 = "src\\components\\_theme-toggle\\ThemeToggle.svelte";

    function create_fragment$5(ctx) {
    	let button;
    	let svg;
    	let path0;
    	let circle;
    	let path1;
    	let button_aria_pressed_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			circle = svg_element("circle");
    			path1 = svg_element("path");
    			attr_dev(path0, "fill", "none");
    			set_style(path0, "--darkreader-inline-fill", "none");
    			attr_dev(path0, "d", "M0 0h256v256H0z");
    			add_location(path0, file$3, 46, 4, 2005);
    			attr_dev(circle, "cx", "128");
    			attr_dev(circle, "cy", "128");
    			attr_dev(circle, "r", "68");
    			add_location(circle, file$3, 47, 4, 2089);
    			attr_dev(path1, "d", "M128 44a8 8 0 008-8V16a8 8 0 00-16 0v20a8 8 0 008 8zM57.29 68.603A8 8 0 1068.603 57.29L54.461 43.147a8 8 0 10-11.314 11.314zM44 128a8 8 0 00-8-8H16a8 8 0 000 16h20a8 8 0 008-8zM57.29 187.397l-14.143 14.142a8 8 0 1011.314 11.314l14.142-14.143a8 8 0 10-11.313-11.313zM128 212a8 8 0 00-8 8v20a8 8 0 0016 0v-20a8 8 0 00-8-8zM198.71 187.397a8 8 0 10-11.313 11.313l14.142 14.143a8 8 0 1011.314-11.314zM240 120h-20a8 8 0 000 16h20a8 8 0 000-16zM193.054 70.946a7.975 7.975 0 005.656-2.343l14.143-14.142a8 8 0 10-11.314-11.314L187.397 57.29a8 8 0 005.657 13.656z");
    			add_location(path1, file$3, 48, 4, 2130);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "fill", "currentColor");
    			attr_dev(svg, "viewBox", "0 0 256 256");
    			set_style(svg, "--darkreader-inline-fill", "#000000");
    			add_location(svg, file$3, 39, 2, 1823);
    			attr_dev(button, "data-message", "Toggle dark mode");
    			attr_dev(button, "aria-pressed", button_aria_pressed_value = /*$theme*/ ctx[0] === "dark");
    			attr_dev(button, "class", "w-8 h-8 m-0 p-0 rounded dark:border-gray-600 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-700 tr-200 text-blue-500 dark:text-yellow-400");
    			add_location(button, file$3, 34, 0, 1513);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, path0);
    			append_dev(svg, circle);
    			append_dev(svg, path1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleTheme*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$theme*/ 1 && button_aria_pressed_value !== (button_aria_pressed_value = /*$theme*/ ctx[0] === "dark")) {
    				attr_dev(button, "aria-pressed", button_aria_pressed_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $theme;
    	validate_store(theme, "theme");
    	component_subscribe($$self, theme, $$value => $$invalidate(0, $theme = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ThemeToggle", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	function toggleTheme() {
    		const t = $theme === "dark"
    		? theme.set("light")
    		: theme.set("dark");

    		// @ts-ignore
    		document.body.className = $theme;
    	}

    	// prettier-ignore
    	function getUserThemePreference() {
    		const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-schemprefersDark)").matches
    		? theme.set("dark")
    		: theme.set("light");
    	}

    	// Immediately invoked function to set the theme on mounting of the component.
    	// prettier-ignore
    	onMount(() => __awaiter(void 0, void 0, void 0, function* () {
    		const t = !$theme
    		? getUserThemePreference()
    		: // @ts-ignore
    			document.body.className = $theme;
    	}));

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ThemeToggle> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		__awaiter,
    		onMount,
    		theme,
    		toggleTheme,
    		getUserThemePreference,
    		$theme
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$theme, toggleTheme];
    }

    class ThemeToggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ThemeToggle",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\_typography\Typography.svelte generated by Svelte v3.31.2 */

    function create_fragment$6(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Typography", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Typography> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Typography extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Typography",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var prism = createCommonjsModule(function (module) {
    /* **********************************************
         Begin prism-core.js
    ********************************************** */

    /// <reference lib="WebWorker"/>

    var _self = (typeof window !== 'undefined')
    	? window   // if in browser
    	: (
    		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
    		? self // if in worker
    		: {}   // if in node js
    	);

    /**
     * Prism: Lightweight, robust, elegant syntax highlighting
     *
     * @license MIT <https://opensource.org/licenses/MIT>
     * @author Lea Verou <https://lea.verou.me>
     * @namespace
     * @public
     */
    var Prism = (function (_self){

    // Private helper vars
    var lang = /\blang(?:uage)?-([\w-]+)\b/i;
    var uniqueId = 0;


    var _ = {
    	/**
    	 * By default, Prism will attempt to highlight all code elements (by calling {@link Prism.highlightAll}) on the
    	 * current page after the page finished loading. This might be a problem if e.g. you wanted to asynchronously load
    	 * additional languages or plugins yourself.
    	 *
    	 * By setting this value to `true`, Prism will not automatically highlight all code elements on the page.
    	 *
    	 * You obviously have to change this value before the automatic highlighting started. To do this, you can add an
    	 * empty Prism object into the global scope before loading the Prism script like this:
    	 *
    	 * ```js
    	 * window.Prism = window.Prism || {};
    	 * Prism.manual = true;
    	 * // add a new <script> to load Prism's script
    	 * ```
    	 *
    	 * @default false
    	 * @type {boolean}
    	 * @memberof Prism
    	 * @public
    	 */
    	manual: _self.Prism && _self.Prism.manual,
    	disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,

    	/**
    	 * A namespace for utility methods.
    	 *
    	 * All function in this namespace that are not explicitly marked as _public_ are for __internal use only__ and may
    	 * change or disappear at any time.
    	 *
    	 * @namespace
    	 * @memberof Prism
    	 */
    	util: {
    		encode: function encode(tokens) {
    			if (tokens instanceof Token) {
    				return new Token(tokens.type, encode(tokens.content), tokens.alias);
    			} else if (Array.isArray(tokens)) {
    				return tokens.map(encode);
    			} else {
    				return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
    			}
    		},

    		/**
    		 * Returns the name of the type of the given value.
    		 *
    		 * @param {any} o
    		 * @returns {string}
    		 * @example
    		 * type(null)      === 'Null'
    		 * type(undefined) === 'Undefined'
    		 * type(123)       === 'Number'
    		 * type('foo')     === 'String'
    		 * type(true)      === 'Boolean'
    		 * type([1, 2])    === 'Array'
    		 * type({})        === 'Object'
    		 * type(String)    === 'Function'
    		 * type(/abc+/)    === 'RegExp'
    		 */
    		type: function (o) {
    			return Object.prototype.toString.call(o).slice(8, -1);
    		},

    		/**
    		 * Returns a unique number for the given object. Later calls will still return the same number.
    		 *
    		 * @param {Object} obj
    		 * @returns {number}
    		 */
    		objId: function (obj) {
    			if (!obj['__id']) {
    				Object.defineProperty(obj, '__id', { value: ++uniqueId });
    			}
    			return obj['__id'];
    		},

    		/**
    		 * Creates a deep clone of the given object.
    		 *
    		 * The main intended use of this function is to clone language definitions.
    		 *
    		 * @param {T} o
    		 * @param {Record<number, any>} [visited]
    		 * @returns {T}
    		 * @template T
    		 */
    		clone: function deepClone(o, visited) {
    			visited = visited || {};

    			var clone, id;
    			switch (_.util.type(o)) {
    				case 'Object':
    					id = _.util.objId(o);
    					if (visited[id]) {
    						return visited[id];
    					}
    					clone = /** @type {Record<string, any>} */ ({});
    					visited[id] = clone;

    					for (var key in o) {
    						if (o.hasOwnProperty(key)) {
    							clone[key] = deepClone(o[key], visited);
    						}
    					}

    					return /** @type {any} */ (clone);

    				case 'Array':
    					id = _.util.objId(o);
    					if (visited[id]) {
    						return visited[id];
    					}
    					clone = [];
    					visited[id] = clone;

    					(/** @type {Array} */(/** @type {any} */(o))).forEach(function (v, i) {
    						clone[i] = deepClone(v, visited);
    					});

    					return /** @type {any} */ (clone);

    				default:
    					return o;
    			}
    		},

    		/**
    		 * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
    		 *
    		 * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
    		 *
    		 * @param {Element} element
    		 * @returns {string}
    		 */
    		getLanguage: function (element) {
    			while (element && !lang.test(element.className)) {
    				element = element.parentElement;
    			}
    			if (element) {
    				return (element.className.match(lang) || [, 'none'])[1].toLowerCase();
    			}
    			return 'none';
    		},

    		/**
    		 * Returns the script element that is currently executing.
    		 *
    		 * This does __not__ work for line script element.
    		 *
    		 * @returns {HTMLScriptElement | null}
    		 */
    		currentScript: function () {
    			if (typeof document === 'undefined') {
    				return null;
    			}
    			if ('currentScript' in document && 1 < 2 /* hack to trip TS' flow analysis */) {
    				return /** @type {any} */ (document.currentScript);
    			}

    			// IE11 workaround
    			// we'll get the src of the current script by parsing IE11's error stack trace
    			// this will not work for inline scripts

    			try {
    				throw new Error();
    			} catch (err) {
    				// Get file src url from stack. Specifically works with the format of stack traces in IE.
    				// A stack will look like this:
    				//
    				// Error
    				//    at _.util.currentScript (http://localhost/components/prism-core.js:119:5)
    				//    at Global code (http://localhost/components/prism-core.js:606:1)

    				var src = (/at [^(\r\n]*\((.*):.+:.+\)$/i.exec(err.stack) || [])[1];
    				if (src) {
    					var scripts = document.getElementsByTagName('script');
    					for (var i in scripts) {
    						if (scripts[i].src == src) {
    							return scripts[i];
    						}
    					}
    				}
    				return null;
    			}
    		},

    		/**
    		 * Returns whether a given class is active for `element`.
    		 *
    		 * The class can be activated if `element` or one of its ancestors has the given class and it can be deactivated
    		 * if `element` or one of its ancestors has the negated version of the given class. The _negated version_ of the
    		 * given class is just the given class with a `no-` prefix.
    		 *
    		 * Whether the class is active is determined by the closest ancestor of `element` (where `element` itself is
    		 * closest ancestor) that has the given class or the negated version of it. If neither `element` nor any of its
    		 * ancestors have the given class or the negated version of it, then the default activation will be returned.
    		 *
    		 * In the paradoxical situation where the closest ancestor contains __both__ the given class and the negated
    		 * version of it, the class is considered active.
    		 *
    		 * @param {Element} element
    		 * @param {string} className
    		 * @param {boolean} [defaultActivation=false]
    		 * @returns {boolean}
    		 */
    		isActive: function (element, className, defaultActivation) {
    			var no = 'no-' + className;

    			while (element) {
    				var classList = element.classList;
    				if (classList.contains(className)) {
    					return true;
    				}
    				if (classList.contains(no)) {
    					return false;
    				}
    				element = element.parentElement;
    			}
    			return !!defaultActivation;
    		}
    	},

    	/**
    	 * This namespace contains all currently loaded languages and the some helper functions to create and modify languages.
    	 *
    	 * @namespace
    	 * @memberof Prism
    	 * @public
    	 */
    	languages: {
    		/**
    		 * Creates a deep copy of the language with the given id and appends the given tokens.
    		 *
    		 * If a token in `redef` also appears in the copied language, then the existing token in the copied language
    		 * will be overwritten at its original position.
    		 *
    		 * ## Best practices
    		 *
    		 * Since the position of overwriting tokens (token in `redef` that overwrite tokens in the copied language)
    		 * doesn't matter, they can technically be in any order. However, this can be confusing to others that trying to
    		 * understand the language definition because, normally, the order of tokens matters in Prism grammars.
    		 *
    		 * Therefore, it is encouraged to order overwriting tokens according to the positions of the overwritten tokens.
    		 * Furthermore, all non-overwriting tokens should be placed after the overwriting ones.
    		 *
    		 * @param {string} id The id of the language to extend. This has to be a key in `Prism.languages`.
    		 * @param {Grammar} redef The new tokens to append.
    		 * @returns {Grammar} The new language created.
    		 * @public
    		 * @example
    		 * Prism.languages['css-with-colors'] = Prism.languages.extend('css', {
    		 *     // Prism.languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
    		 *     // at its original position
    		 *     'comment': { ... },
    		 *     // CSS doesn't have a 'color' token, so this token will be appended
    		 *     'color': /\b(?:red|green|blue)\b/
    		 * });
    		 */
    		extend: function (id, redef) {
    			var lang = _.util.clone(_.languages[id]);

    			for (var key in redef) {
    				lang[key] = redef[key];
    			}

    			return lang;
    		},

    		/**
    		 * Inserts tokens _before_ another token in a language definition or any other grammar.
    		 *
    		 * ## Usage
    		 *
    		 * This helper method makes it easy to modify existing languages. For example, the CSS language definition
    		 * not only defines CSS highlighting for CSS documents, but also needs to define highlighting for CSS embedded
    		 * in HTML through `<style>` elements. To do this, it needs to modify `Prism.languages.markup` and add the
    		 * appropriate tokens. However, `Prism.languages.markup` is a regular JavaScript object literal, so if you do
    		 * this:
    		 *
    		 * ```js
    		 * Prism.languages.markup.style = {
    		 *     // token
    		 * };
    		 * ```
    		 *
    		 * then the `style` token will be added (and processed) at the end. `insertBefore` allows you to insert tokens
    		 * before existing tokens. For the CSS example above, you would use it like this:
    		 *
    		 * ```js
    		 * Prism.languages.insertBefore('markup', 'cdata', {
    		 *     'style': {
    		 *         // token
    		 *     }
    		 * });
    		 * ```
    		 *
    		 * ## Special cases
    		 *
    		 * If the grammars of `inside` and `insert` have tokens with the same name, the tokens in `inside`'s grammar
    		 * will be ignored.
    		 *
    		 * This behavior can be used to insert tokens after `before`:
    		 *
    		 * ```js
    		 * Prism.languages.insertBefore('markup', 'comment', {
    		 *     'comment': Prism.languages.markup.comment,
    		 *     // tokens after 'comment'
    		 * });
    		 * ```
    		 *
    		 * ## Limitations
    		 *
    		 * The main problem `insertBefore` has to solve is iteration order. Since ES2015, the iteration order for object
    		 * properties is guaranteed to be the insertion order (except for integer keys) but some browsers behave
    		 * differently when keys are deleted and re-inserted. So `insertBefore` can't be implemented by temporarily
    		 * deleting properties which is necessary to insert at arbitrary positions.
    		 *
    		 * To solve this problem, `insertBefore` doesn't actually insert the given tokens into the target object.
    		 * Instead, it will create a new object and replace all references to the target object with the new one. This
    		 * can be done without temporarily deleting properties, so the iteration order is well-defined.
    		 *
    		 * However, only references that can be reached from `Prism.languages` or `insert` will be replaced. I.e. if
    		 * you hold the target object in a variable, then the value of the variable will not change.
    		 *
    		 * ```js
    		 * var oldMarkup = Prism.languages.markup;
    		 * var newMarkup = Prism.languages.insertBefore('markup', 'comment', { ... });
    		 *
    		 * assert(oldMarkup !== Prism.languages.markup);
    		 * assert(newMarkup === Prism.languages.markup);
    		 * ```
    		 *
    		 * @param {string} inside The property of `root` (e.g. a language id in `Prism.languages`) that contains the
    		 * object to be modified.
    		 * @param {string} before The key to insert before.
    		 * @param {Grammar} insert An object containing the key-value pairs to be inserted.
    		 * @param {Object<string, any>} [root] The object containing `inside`, i.e. the object that contains the
    		 * object to be modified.
    		 *
    		 * Defaults to `Prism.languages`.
    		 * @returns {Grammar} The new grammar object.
    		 * @public
    		 */
    		insertBefore: function (inside, before, insert, root) {
    			root = root || /** @type {any} */ (_.languages);
    			var grammar = root[inside];
    			/** @type {Grammar} */
    			var ret = {};

    			for (var token in grammar) {
    				if (grammar.hasOwnProperty(token)) {

    					if (token == before) {
    						for (var newToken in insert) {
    							if (insert.hasOwnProperty(newToken)) {
    								ret[newToken] = insert[newToken];
    							}
    						}
    					}

    					// Do not insert token which also occur in insert. See #1525
    					if (!insert.hasOwnProperty(token)) {
    						ret[token] = grammar[token];
    					}
    				}
    			}

    			var old = root[inside];
    			root[inside] = ret;

    			// Update references in other language definitions
    			_.languages.DFS(_.languages, function(key, value) {
    				if (value === old && key != inside) {
    					this[key] = ret;
    				}
    			});

    			return ret;
    		},

    		// Traverse a language definition with Depth First Search
    		DFS: function DFS(o, callback, type, visited) {
    			visited = visited || {};

    			var objId = _.util.objId;

    			for (var i in o) {
    				if (o.hasOwnProperty(i)) {
    					callback.call(o, i, o[i], type || i);

    					var property = o[i],
    					    propertyType = _.util.type(property);

    					if (propertyType === 'Object' && !visited[objId(property)]) {
    						visited[objId(property)] = true;
    						DFS(property, callback, null, visited);
    					}
    					else if (propertyType === 'Array' && !visited[objId(property)]) {
    						visited[objId(property)] = true;
    						DFS(property, callback, i, visited);
    					}
    				}
    			}
    		}
    	},

    	plugins: {},

    	/**
    	 * This is the most high-level function in Prism’s API.
    	 * It fetches all the elements that have a `.language-xxxx` class and then calls {@link Prism.highlightElement} on
    	 * each one of them.
    	 *
    	 * This is equivalent to `Prism.highlightAllUnder(document, async, callback)`.
    	 *
    	 * @param {boolean} [async=false] Same as in {@link Prism.highlightAllUnder}.
    	 * @param {HighlightCallback} [callback] Same as in {@link Prism.highlightAllUnder}.
    	 * @memberof Prism
    	 * @public
    	 */
    	highlightAll: function(async, callback) {
    		_.highlightAllUnder(document, async, callback);
    	},

    	/**
    	 * Fetches all the descendants of `container` that have a `.language-xxxx` class and then calls
    	 * {@link Prism.highlightElement} on each one of them.
    	 *
    	 * The following hooks will be run:
    	 * 1. `before-highlightall`
    	 * 2. `before-all-elements-highlight`
    	 * 3. All hooks of {@link Prism.highlightElement} for each element.
    	 *
    	 * @param {ParentNode} container The root element, whose descendants that have a `.language-xxxx` class will be highlighted.
    	 * @param {boolean} [async=false] Whether each element is to be highlighted asynchronously using Web Workers.
    	 * @param {HighlightCallback} [callback] An optional callback to be invoked on each element after its highlighting is done.
    	 * @memberof Prism
    	 * @public
    	 */
    	highlightAllUnder: function(container, async, callback) {
    		var env = {
    			callback: callback,
    			container: container,
    			selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
    		};

    		_.hooks.run('before-highlightall', env);

    		env.elements = Array.prototype.slice.apply(env.container.querySelectorAll(env.selector));

    		_.hooks.run('before-all-elements-highlight', env);

    		for (var i = 0, element; element = env.elements[i++];) {
    			_.highlightElement(element, async === true, env.callback);
    		}
    	},

    	/**
    	 * Highlights the code inside a single element.
    	 *
    	 * The following hooks will be run:
    	 * 1. `before-sanity-check`
    	 * 2. `before-highlight`
    	 * 3. All hooks of {@link Prism.highlight}. These hooks will be run by an asynchronous worker if `async` is `true`.
    	 * 4. `before-insert`
    	 * 5. `after-highlight`
    	 * 6. `complete`
    	 *
    	 * Some the above hooks will be skipped if the element doesn't contain any text or there is no grammar loaded for
    	 * the element's language.
    	 *
    	 * @param {Element} element The element containing the code.
    	 * It must have a class of `language-xxxx` to be processed, where `xxxx` is a valid language identifier.
    	 * @param {boolean} [async=false] Whether the element is to be highlighted asynchronously using Web Workers
    	 * to improve performance and avoid blocking the UI when highlighting very large chunks of code. This option is
    	 * [disabled by default](https://prismjs.com/faq.html#why-is-asynchronous-highlighting-disabled-by-default).
    	 *
    	 * Note: All language definitions required to highlight the code must be included in the main `prism.js` file for
    	 * asynchronous highlighting to work. You can build your own bundle on the
    	 * [Download page](https://prismjs.com/download.html).
    	 * @param {HighlightCallback} [callback] An optional callback to be invoked after the highlighting is done.
    	 * Mostly useful when `async` is `true`, since in that case, the highlighting is done asynchronously.
    	 * @memberof Prism
    	 * @public
    	 */
    	highlightElement: function(element, async, callback) {
    		// Find language
    		var language = _.util.getLanguage(element);
    		var grammar = _.languages[language];

    		// Set language on the element, if not present
    		element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

    		// Set language on the parent, for styling
    		var parent = element.parentElement;
    		if (parent && parent.nodeName.toLowerCase() === 'pre') {
    			parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
    		}

    		var code = element.textContent;

    		var env = {
    			element: element,
    			language: language,
    			grammar: grammar,
    			code: code
    		};

    		function insertHighlightedCode(highlightedCode) {
    			env.highlightedCode = highlightedCode;

    			_.hooks.run('before-insert', env);

    			env.element.innerHTML = env.highlightedCode;

    			_.hooks.run('after-highlight', env);
    			_.hooks.run('complete', env);
    			callback && callback.call(env.element);
    		}

    		_.hooks.run('before-sanity-check', env);

    		if (!env.code) {
    			_.hooks.run('complete', env);
    			callback && callback.call(env.element);
    			return;
    		}

    		_.hooks.run('before-highlight', env);

    		if (!env.grammar) {
    			insertHighlightedCode(_.util.encode(env.code));
    			return;
    		}

    		if (async && _self.Worker) {
    			var worker = new Worker(_.filename);

    			worker.onmessage = function(evt) {
    				insertHighlightedCode(evt.data);
    			};

    			worker.postMessage(JSON.stringify({
    				language: env.language,
    				code: env.code,
    				immediateClose: true
    			}));
    		}
    		else {
    			insertHighlightedCode(_.highlight(env.code, env.grammar, env.language));
    		}
    	},

    	/**
    	 * Low-level function, only use if you know what you’re doing. It accepts a string of text as input
    	 * and the language definitions to use, and returns a string with the HTML produced.
    	 *
    	 * The following hooks will be run:
    	 * 1. `before-tokenize`
    	 * 2. `after-tokenize`
    	 * 3. `wrap`: On each {@link Token}.
    	 *
    	 * @param {string} text A string with the code to be highlighted.
    	 * @param {Grammar} grammar An object containing the tokens to use.
    	 *
    	 * Usually a language definition like `Prism.languages.markup`.
    	 * @param {string} language The name of the language definition passed to `grammar`.
    	 * @returns {string} The highlighted HTML.
    	 * @memberof Prism
    	 * @public
    	 * @example
    	 * Prism.highlight('var foo = true;', Prism.languages.javascript, 'javascript');
    	 */
    	highlight: function (text, grammar, language) {
    		var env = {
    			code: text,
    			grammar: grammar,
    			language: language
    		};
    		_.hooks.run('before-tokenize', env);
    		env.tokens = _.tokenize(env.code, env.grammar);
    		_.hooks.run('after-tokenize', env);
    		return Token.stringify(_.util.encode(env.tokens), env.language);
    	},

    	/**
    	 * This is the heart of Prism, and the most low-level function you can use. It accepts a string of text as input
    	 * and the language definitions to use, and returns an array with the tokenized code.
    	 *
    	 * When the language definition includes nested tokens, the function is called recursively on each of these tokens.
    	 *
    	 * This method could be useful in other contexts as well, as a very crude parser.
    	 *
    	 * @param {string} text A string with the code to be highlighted.
    	 * @param {Grammar} grammar An object containing the tokens to use.
    	 *
    	 * Usually a language definition like `Prism.languages.markup`.
    	 * @returns {TokenStream} An array of strings and tokens, a token stream.
    	 * @memberof Prism
    	 * @public
    	 * @example
    	 * let code = `var foo = 0;`;
    	 * let tokens = Prism.tokenize(code, Prism.languages.javascript);
    	 * tokens.forEach(token => {
    	 *     if (token instanceof Prism.Token && token.type === 'number') {
    	 *         console.log(`Found numeric literal: ${token.content}`);
    	 *     }
    	 * });
    	 */
    	tokenize: function(text, grammar) {
    		var rest = grammar.rest;
    		if (rest) {
    			for (var token in rest) {
    				grammar[token] = rest[token];
    			}

    			delete grammar.rest;
    		}

    		var tokenList = new LinkedList();
    		addAfter(tokenList, tokenList.head, text);

    		matchGrammar(text, tokenList, grammar, tokenList.head, 0);

    		return toArray(tokenList);
    	},

    	/**
    	 * @namespace
    	 * @memberof Prism
    	 * @public
    	 */
    	hooks: {
    		all: {},

    		/**
    		 * Adds the given callback to the list of callbacks for the given hook.
    		 *
    		 * The callback will be invoked when the hook it is registered for is run.
    		 * Hooks are usually directly run by a highlight function but you can also run hooks yourself.
    		 *
    		 * One callback function can be registered to multiple hooks and the same hook multiple times.
    		 *
    		 * @param {string} name The name of the hook.
    		 * @param {HookCallback} callback The callback function which is given environment variables.
    		 * @public
    		 */
    		add: function (name, callback) {
    			var hooks = _.hooks.all;

    			hooks[name] = hooks[name] || [];

    			hooks[name].push(callback);
    		},

    		/**
    		 * Runs a hook invoking all registered callbacks with the given environment variables.
    		 *
    		 * Callbacks will be invoked synchronously and in the order in which they were registered.
    		 *
    		 * @param {string} name The name of the hook.
    		 * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
    		 * @public
    		 */
    		run: function (name, env) {
    			var callbacks = _.hooks.all[name];

    			if (!callbacks || !callbacks.length) {
    				return;
    			}

    			for (var i=0, callback; callback = callbacks[i++];) {
    				callback(env);
    			}
    		}
    	},

    	Token: Token
    };
    _self.Prism = _;


    // Typescript note:
    // The following can be used to import the Token type in JSDoc:
    //
    //   @typedef {InstanceType<import("./prism-core")["Token"]>} Token

    /**
     * Creates a new token.
     *
     * @param {string} type See {@link Token#type type}
     * @param {string | TokenStream} content See {@link Token#content content}
     * @param {string|string[]} [alias] The alias(es) of the token.
     * @param {string} [matchedStr=""] A copy of the full string this token was created from.
     * @class
     * @global
     * @public
     */
    function Token(type, content, alias, matchedStr) {
    	/**
    	 * The type of the token.
    	 *
    	 * This is usually the key of a pattern in a {@link Grammar}.
    	 *
    	 * @type {string}
    	 * @see GrammarToken
    	 * @public
    	 */
    	this.type = type;
    	/**
    	 * The strings or tokens contained by this token.
    	 *
    	 * This will be a token stream if the pattern matched also defined an `inside` grammar.
    	 *
    	 * @type {string | TokenStream}
    	 * @public
    	 */
    	this.content = content;
    	/**
    	 * The alias(es) of the token.
    	 *
    	 * @type {string|string[]}
    	 * @see GrammarToken
    	 * @public
    	 */
    	this.alias = alias;
    	// Copy of the full string this token was created from
    	this.length = (matchedStr || '').length | 0;
    }

    /**
     * A token stream is an array of strings and {@link Token Token} objects.
     *
     * Token streams have to fulfill a few properties that are assumed by most functions (mostly internal ones) that process
     * them.
     *
     * 1. No adjacent strings.
     * 2. No empty strings.
     *
     *    The only exception here is the token stream that only contains the empty string and nothing else.
     *
     * @typedef {Array<string | Token>} TokenStream
     * @global
     * @public
     */

    /**
     * Converts the given token or token stream to an HTML representation.
     *
     * The following hooks will be run:
     * 1. `wrap`: On each {@link Token}.
     *
     * @param {string | Token | TokenStream} o The token or token stream to be converted.
     * @param {string} language The name of current language.
     * @returns {string} The HTML representation of the token or token stream.
     * @memberof Token
     * @static
     */
    Token.stringify = function stringify(o, language) {
    	if (typeof o == 'string') {
    		return o;
    	}
    	if (Array.isArray(o)) {
    		var s = '';
    		o.forEach(function (e) {
    			s += stringify(e, language);
    		});
    		return s;
    	}

    	var env = {
    		type: o.type,
    		content: stringify(o.content, language),
    		tag: 'span',
    		classes: ['token', o.type],
    		attributes: {},
    		language: language
    	};

    	var aliases = o.alias;
    	if (aliases) {
    		if (Array.isArray(aliases)) {
    			Array.prototype.push.apply(env.classes, aliases);
    		} else {
    			env.classes.push(aliases);
    		}
    	}

    	_.hooks.run('wrap', env);

    	var attributes = '';
    	for (var name in env.attributes) {
    		attributes += ' ' + name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
    	}

    	return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + attributes + '>' + env.content + '</' + env.tag + '>';
    };

    /**
     * @param {RegExp} pattern
     * @param {number} pos
     * @param {string} text
     * @param {boolean} lookbehind
     * @returns {RegExpExecArray | null}
     */
    function matchPattern(pattern, pos, text, lookbehind) {
    	pattern.lastIndex = pos;
    	var match = pattern.exec(text);
    	if (match && lookbehind && match[1]) {
    		// change the match to remove the text matched by the Prism lookbehind group
    		var lookbehindLength = match[1].length;
    		match.index += lookbehindLength;
    		match[0] = match[0].slice(lookbehindLength);
    	}
    	return match;
    }

    /**
     * @param {string} text
     * @param {LinkedList<string | Token>} tokenList
     * @param {any} grammar
     * @param {LinkedListNode<string | Token>} startNode
     * @param {number} startPos
     * @param {RematchOptions} [rematch]
     * @returns {void}
     * @private
     *
     * @typedef RematchOptions
     * @property {string} cause
     * @property {number} reach
     */
    function matchGrammar(text, tokenList, grammar, startNode, startPos, rematch) {
    	for (var token in grammar) {
    		if (!grammar.hasOwnProperty(token) || !grammar[token]) {
    			continue;
    		}

    		var patterns = grammar[token];
    		patterns = Array.isArray(patterns) ? patterns : [patterns];

    		for (var j = 0; j < patterns.length; ++j) {
    			if (rematch && rematch.cause == token + ',' + j) {
    				return;
    			}

    			var patternObj = patterns[j],
    				inside = patternObj.inside,
    				lookbehind = !!patternObj.lookbehind,
    				greedy = !!patternObj.greedy,
    				alias = patternObj.alias;

    			if (greedy && !patternObj.pattern.global) {
    				// Without the global flag, lastIndex won't work
    				var flags = patternObj.pattern.toString().match(/[imsuy]*$/)[0];
    				patternObj.pattern = RegExp(patternObj.pattern.source, flags + 'g');
    			}

    			/** @type {RegExp} */
    			var pattern = patternObj.pattern || patternObj;

    			for ( // iterate the token list and keep track of the current token/string position
    				var currentNode = startNode.next, pos = startPos;
    				currentNode !== tokenList.tail;
    				pos += currentNode.value.length, currentNode = currentNode.next
    			) {

    				if (rematch && pos >= rematch.reach) {
    					break;
    				}

    				var str = currentNode.value;

    				if (tokenList.length > text.length) {
    					// Something went terribly wrong, ABORT, ABORT!
    					return;
    				}

    				if (str instanceof Token) {
    					continue;
    				}

    				var removeCount = 1; // this is the to parameter of removeBetween
    				var match;

    				if (greedy) {
    					match = matchPattern(pattern, pos, text, lookbehind);
    					if (!match) {
    						break;
    					}

    					var from = match.index;
    					var to = match.index + match[0].length;
    					var p = pos;

    					// find the node that contains the match
    					p += currentNode.value.length;
    					while (from >= p) {
    						currentNode = currentNode.next;
    						p += currentNode.value.length;
    					}
    					// adjust pos (and p)
    					p -= currentNode.value.length;
    					pos = p;

    					// the current node is a Token, then the match starts inside another Token, which is invalid
    					if (currentNode.value instanceof Token) {
    						continue;
    					}

    					// find the last node which is affected by this match
    					for (
    						var k = currentNode;
    						k !== tokenList.tail && (p < to || typeof k.value === 'string');
    						k = k.next
    					) {
    						removeCount++;
    						p += k.value.length;
    					}
    					removeCount--;

    					// replace with the new match
    					str = text.slice(pos, p);
    					match.index -= pos;
    				} else {
    					match = matchPattern(pattern, 0, str, lookbehind);
    					if (!match) {
    						continue;
    					}
    				}

    				var from = match.index,
    					matchStr = match[0],
    					before = str.slice(0, from),
    					after = str.slice(from + matchStr.length);

    				var reach = pos + str.length;
    				if (rematch && reach > rematch.reach) {
    					rematch.reach = reach;
    				}

    				var removeFrom = currentNode.prev;

    				if (before) {
    					removeFrom = addAfter(tokenList, removeFrom, before);
    					pos += before.length;
    				}

    				removeRange(tokenList, removeFrom, removeCount);

    				var wrapped = new Token(token, inside ? _.tokenize(matchStr, inside) : matchStr, alias, matchStr);
    				currentNode = addAfter(tokenList, removeFrom, wrapped);

    				if (after) {
    					addAfter(tokenList, currentNode, after);
    				}

    				if (removeCount > 1) {
    					// at least one Token object was removed, so we have to do some rematching
    					// this can only happen if the current pattern is greedy
    					matchGrammar(text, tokenList, grammar, currentNode.prev, pos, {
    						cause: token + ',' + j,
    						reach: reach
    					});
    				}
    			}
    		}
    	}
    }

    /**
     * @typedef LinkedListNode
     * @property {T} value
     * @property {LinkedListNode<T> | null} prev The previous node.
     * @property {LinkedListNode<T> | null} next The next node.
     * @template T
     * @private
     */

    /**
     * @template T
     * @private
     */
    function LinkedList() {
    	/** @type {LinkedListNode<T>} */
    	var head = { value: null, prev: null, next: null };
    	/** @type {LinkedListNode<T>} */
    	var tail = { value: null, prev: head, next: null };
    	head.next = tail;

    	/** @type {LinkedListNode<T>} */
    	this.head = head;
    	/** @type {LinkedListNode<T>} */
    	this.tail = tail;
    	this.length = 0;
    }

    /**
     * Adds a new node with the given value to the list.
     * @param {LinkedList<T>} list
     * @param {LinkedListNode<T>} node
     * @param {T} value
     * @returns {LinkedListNode<T>} The added node.
     * @template T
     */
    function addAfter(list, node, value) {
    	// assumes that node != list.tail && values.length >= 0
    	var next = node.next;

    	var newNode = { value: value, prev: node, next: next };
    	node.next = newNode;
    	next.prev = newNode;
    	list.length++;

    	return newNode;
    }
    /**
     * Removes `count` nodes after the given node. The given node will not be removed.
     * @param {LinkedList<T>} list
     * @param {LinkedListNode<T>} node
     * @param {number} count
     * @template T
     */
    function removeRange(list, node, count) {
    	var next = node.next;
    	for (var i = 0; i < count && next !== list.tail; i++) {
    		next = next.next;
    	}
    	node.next = next;
    	next.prev = node;
    	list.length -= i;
    }
    /**
     * @param {LinkedList<T>} list
     * @returns {T[]}
     * @template T
     */
    function toArray(list) {
    	var array = [];
    	var node = list.head.next;
    	while (node !== list.tail) {
    		array.push(node.value);
    		node = node.next;
    	}
    	return array;
    }


    if (!_self.document) {
    	if (!_self.addEventListener) {
    		// in Node.js
    		return _;
    	}

    	if (!_.disableWorkerMessageHandler) {
    		// In worker
    		_self.addEventListener('message', function (evt) {
    			var message = JSON.parse(evt.data),
    				lang = message.language,
    				code = message.code,
    				immediateClose = message.immediateClose;

    			_self.postMessage(_.highlight(code, _.languages[lang], lang));
    			if (immediateClose) {
    				_self.close();
    			}
    		}, false);
    	}

    	return _;
    }

    // Get current script and highlight
    var script = _.util.currentScript();

    if (script) {
    	_.filename = script.src;

    	if (script.hasAttribute('data-manual')) {
    		_.manual = true;
    	}
    }

    function highlightAutomaticallyCallback() {
    	if (!_.manual) {
    		_.highlightAll();
    	}
    }

    if (!_.manual) {
    	// If the document state is "loading", then we'll use DOMContentLoaded.
    	// If the document state is "interactive" and the prism.js script is deferred, then we'll also use the
    	// DOMContentLoaded event because there might be some plugins or languages which have also been deferred and they
    	// might take longer one animation frame to execute which can create a race condition where only some plugins have
    	// been loaded when Prism.highlightAll() is executed, depending on how fast resources are loaded.
    	// See https://github.com/PrismJS/prism/issues/2102
    	var readyState = document.readyState;
    	if (readyState === 'loading' || readyState === 'interactive' && script && script.defer) {
    		document.addEventListener('DOMContentLoaded', highlightAutomaticallyCallback);
    	} else {
    		if (window.requestAnimationFrame) {
    			window.requestAnimationFrame(highlightAutomaticallyCallback);
    		} else {
    			window.setTimeout(highlightAutomaticallyCallback, 16);
    		}
    	}
    }

    return _;

    })(_self);

    if ( module.exports) {
    	module.exports = Prism;
    }

    // hack for components to work correctly in node.js
    if (typeof commonjsGlobal !== 'undefined') {
    	commonjsGlobal.Prism = Prism;
    }

    // some additional documentation/types

    /**
     * The expansion of a simple `RegExp` literal to support additional properties.
     *
     * @typedef GrammarToken
     * @property {RegExp} pattern The regular expression of the token.
     * @property {boolean} [lookbehind=false] If `true`, then the first capturing group of `pattern` will (effectively)
     * behave as a lookbehind group meaning that the captured text will not be part of the matched text of the new token.
     * @property {boolean} [greedy=false] Whether the token is greedy.
     * @property {string|string[]} [alias] An optional alias or list of aliases.
     * @property {Grammar} [inside] The nested grammar of this token.
     *
     * The `inside` grammar will be used to tokenize the text value of each token of this kind.
     *
     * This can be used to make nested and even recursive language definitions.
     *
     * Note: This can cause infinite recursion. Be careful when you embed different languages or even the same language into
     * each another.
     * @global
     * @public
    */

    /**
     * @typedef Grammar
     * @type {Object<string, RegExp | GrammarToken | Array<RegExp | GrammarToken>>}
     * @property {Grammar} [rest] An optional grammar object that will be appended to this grammar.
     * @global
     * @public
     */

    /**
     * A function which will invoked after an element was successfully highlighted.
     *
     * @callback HighlightCallback
     * @param {Element} element The element successfully highlighted.
     * @returns {void}
     * @global
     * @public
    */

    /**
     * @callback HookCallback
     * @param {Object<string, any>} env The environment variables of the hook.
     * @returns {void}
     * @global
     * @public
     */


    /* **********************************************
         Begin prism-markup.js
    ********************************************** */

    Prism.languages.markup = {
    	'comment': /<!--[\s\S]*?-->/,
    	'prolog': /<\?[\s\S]+?\?>/,
    	'doctype': {
    		// https://www.w3.org/TR/xml/#NT-doctypedecl
    		pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
    		greedy: true,
    		inside: {
    			'internal-subset': {
    				pattern: /(\[)[\s\S]+(?=\]>$)/,
    				lookbehind: true,
    				greedy: true,
    				inside: null // see below
    			},
    			'string': {
    				pattern: /"[^"]*"|'[^']*'/,
    				greedy: true
    			},
    			'punctuation': /^<!|>$|[[\]]/,
    			'doctype-tag': /^DOCTYPE/,
    			'name': /[^\s<>'"]+/
    		}
    	},
    	'cdata': /<!\[CDATA\[[\s\S]*?]]>/i,
    	'tag': {
    		pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
    		greedy: true,
    		inside: {
    			'tag': {
    				pattern: /^<\/?[^\s>\/]+/,
    				inside: {
    					'punctuation': /^<\/?/,
    					'namespace': /^[^\s>\/:]+:/
    				}
    			},
    			'attr-value': {
    				pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
    				inside: {
    					'punctuation': [
    						{
    							pattern: /^=/,
    							alias: 'attr-equals'
    						},
    						/"|'/
    					]
    				}
    			},
    			'punctuation': /\/?>/,
    			'attr-name': {
    				pattern: /[^\s>\/]+/,
    				inside: {
    					'namespace': /^[^\s>\/:]+:/
    				}
    			}

    		}
    	},
    	'entity': [
    		{
    			pattern: /&[\da-z]{1,8};/i,
    			alias: 'named-entity'
    		},
    		/&#x?[\da-f]{1,8};/i
    	]
    };

    Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
    	Prism.languages.markup['entity'];
    Prism.languages.markup['doctype'].inside['internal-subset'].inside = Prism.languages.markup;

    // Plugin to make entity title show the real entity, idea by Roman Komarov
    Prism.hooks.add('wrap', function (env) {

    	if (env.type === 'entity') {
    		env.attributes['title'] = env.content.replace(/&amp;/, '&');
    	}
    });

    Object.defineProperty(Prism.languages.markup.tag, 'addInlined', {
    	/**
    	 * Adds an inlined language to markup.
    	 *
    	 * An example of an inlined language is CSS with `<style>` tags.
    	 *
    	 * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
    	 * case insensitive.
    	 * @param {string} lang The language key.
    	 * @example
    	 * addInlined('style', 'css');
    	 */
    	value: function addInlined(tagName, lang) {
    		var includedCdataInside = {};
    		includedCdataInside['language-' + lang] = {
    			pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
    			lookbehind: true,
    			inside: Prism.languages[lang]
    		};
    		includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;

    		var inside = {
    			'included-cdata': {
    				pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
    				inside: includedCdataInside
    			}
    		};
    		inside['language-' + lang] = {
    			pattern: /[\s\S]+/,
    			inside: Prism.languages[lang]
    		};

    		var def = {};
    		def[tagName] = {
    			pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function () { return tagName; }), 'i'),
    			lookbehind: true,
    			greedy: true,
    			inside: inside
    		};

    		Prism.languages.insertBefore('markup', 'cdata', def);
    	}
    });

    Prism.languages.html = Prism.languages.markup;
    Prism.languages.mathml = Prism.languages.markup;
    Prism.languages.svg = Prism.languages.markup;

    Prism.languages.xml = Prism.languages.extend('markup', {});
    Prism.languages.ssml = Prism.languages.xml;
    Prism.languages.atom = Prism.languages.xml;
    Prism.languages.rss = Prism.languages.xml;


    /* **********************************************
         Begin prism-css.js
    ********************************************** */

    (function (Prism) {

    	var string = /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/;

    	Prism.languages.css = {
    		'comment': /\/\*[\s\S]*?\*\//,
    		'atrule': {
    			pattern: /@[\w-](?:[^;{\s]|\s+(?![\s{]))*(?:;|(?=\s*\{))/,
    			inside: {
    				'rule': /^@[\w-]+/,
    				'selector-function-argument': {
    					pattern: /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,
    					lookbehind: true,
    					alias: 'selector'
    				},
    				'keyword': {
    					pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/,
    					lookbehind: true
    				}
    				// See rest below
    			}
    		},
    		'url': {
    			// https://drafts.csswg.org/css-values-3/#urls
    			pattern: RegExp('\\burl\\((?:' + string.source + '|' + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ')\\)', 'i'),
    			greedy: true,
    			inside: {
    				'function': /^url/i,
    				'punctuation': /^\(|\)$/,
    				'string': {
    					pattern: RegExp('^' + string.source + '$'),
    					alias: 'url'
    				}
    			}
    		},
    		'selector': RegExp('[^{}\\s](?:[^{};"\'\\s]|\\s+(?![\\s{])|' + string.source + ')*(?=\\s*\\{)'),
    		'string': {
    			pattern: string,
    			greedy: true
    		},
    		'property': /(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,
    		'important': /!important\b/i,
    		'function': /[-a-z0-9]+(?=\()/i,
    		'punctuation': /[(){};:,]/
    	};

    	Prism.languages.css['atrule'].inside.rest = Prism.languages.css;

    	var markup = Prism.languages.markup;
    	if (markup) {
    		markup.tag.addInlined('style', 'css');

    		Prism.languages.insertBefore('inside', 'attr-value', {
    			'style-attr': {
    				pattern: /(^|["'\s])style\s*=\s*(?:"[^"]*"|'[^']*')/i,
    				lookbehind: true,
    				inside: {
    					'attr-value': {
    						pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
    						inside: {
    							'style': {
    								pattern: /(["'])[\s\S]+(?=["']$)/,
    								lookbehind: true,
    								alias: 'language-css',
    								inside: Prism.languages.css
    							},
    							'punctuation': [
    								{
    									pattern: /^=/,
    									alias: 'attr-equals'
    								},
    								/"|'/
    							]
    						}
    					},
    					'attr-name': /^style/i
    				}
    			}
    		}, markup.tag);
    	}

    }(Prism));


    /* **********************************************
         Begin prism-clike.js
    ********************************************** */

    Prism.languages.clike = {
    	'comment': [
    		{
    			pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
    			lookbehind: true,
    			greedy: true
    		},
    		{
    			pattern: /(^|[^\\:])\/\/.*/,
    			lookbehind: true,
    			greedy: true
    		}
    	],
    	'string': {
    		pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    		greedy: true
    	},
    	'class-name': {
    		pattern: /(\b(?:class|interface|extends|implements|trait|instanceof|new)\s+|\bcatch\s+\()[\w.\\]+/i,
    		lookbehind: true,
    		inside: {
    			'punctuation': /[.\\]/
    		}
    	},
    	'keyword': /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
    	'boolean': /\b(?:true|false)\b/,
    	'function': /\w+(?=\()/,
    	'number': /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
    	'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
    	'punctuation': /[{}[\];(),.:]/
    };


    /* **********************************************
         Begin prism-javascript.js
    ********************************************** */

    Prism.languages.javascript = Prism.languages.extend('clike', {
    	'class-name': [
    		Prism.languages.clike['class-name'],
    		{
    			pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:prototype|constructor))/,
    			lookbehind: true
    		}
    	],
    	'keyword': [
    		{
    			pattern: /((?:^|})\s*)(?:catch|finally)\b/,
    			lookbehind: true
    		},
    		{
    			pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|(?:get|set)(?=\s*[\[$\w\xA0-\uFFFF])|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
    			lookbehind: true
    		},
    	],
    	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
    	'function': /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
    	'number': /\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/,
    	'operator': /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/
    });

    Prism.languages.javascript['class-name'][0].pattern = /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/;

    Prism.languages.insertBefore('javascript', 'keyword', {
    	'regex': {
    		pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)\/(?:\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/,
    		lookbehind: true,
    		greedy: true,
    		inside: {
    			'regex-source': {
    				pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
    				lookbehind: true,
    				alias: 'language-regex',
    				inside: Prism.languages.regex
    			},
    			'regex-flags': /[a-z]+$/,
    			'regex-delimiter': /^\/|\/$/
    		}
    	},
    	// This must be declared before keyword because we use "function" inside the look-forward
    	'function-variable': {
    		pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,
    		alias: 'function'
    	},
    	'parameter': [
    		{
    			pattern: /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
    			lookbehind: true,
    			inside: Prism.languages.javascript
    		},
    		{
    			pattern: /(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
    			inside: Prism.languages.javascript
    		},
    		{
    			pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
    			lookbehind: true,
    			inside: Prism.languages.javascript
    		},
    		{
    			pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
    			lookbehind: true,
    			inside: Prism.languages.javascript
    		}
    	],
    	'constant': /\b[A-Z](?:[A-Z_]|\dx?)*\b/
    });

    Prism.languages.insertBefore('javascript', 'string', {
    	'template-string': {
    		pattern: /`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}|(?!\${)[^\\`])*`/,
    		greedy: true,
    		inside: {
    			'template-punctuation': {
    				pattern: /^`|`$/,
    				alias: 'string'
    			},
    			'interpolation': {
    				pattern: /((?:^|[^\\])(?:\\{2})*)\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}/,
    				lookbehind: true,
    				inside: {
    					'interpolation-punctuation': {
    						pattern: /^\${|}$/,
    						alias: 'punctuation'
    					},
    					rest: Prism.languages.javascript
    				}
    			},
    			'string': /[\s\S]+/
    		}
    	}
    });

    if (Prism.languages.markup) {
    	Prism.languages.markup.tag.addInlined('script', 'javascript');
    }

    Prism.languages.js = Prism.languages.javascript;


    /* **********************************************
         Begin prism-file-highlight.js
    ********************************************** */

    (function () {
    	if (typeof self === 'undefined' || !self.Prism || !self.document) {
    		return;
    	}

    	// https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
    	if (!Element.prototype.matches) {
    		Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    	}

    	var Prism = window.Prism;

    	var LOADING_MESSAGE = 'Loading…';
    	var FAILURE_MESSAGE = function (status, message) {
    		return '✖ Error ' + status + ' while fetching file: ' + message;
    	};
    	var FAILURE_EMPTY_MESSAGE = '✖ Error: File does not exist or is empty';

    	var EXTENSIONS = {
    		'js': 'javascript',
    		'py': 'python',
    		'rb': 'ruby',
    		'ps1': 'powershell',
    		'psm1': 'powershell',
    		'sh': 'bash',
    		'bat': 'batch',
    		'h': 'c',
    		'tex': 'latex'
    	};

    	var STATUS_ATTR = 'data-src-status';
    	var STATUS_LOADING = 'loading';
    	var STATUS_LOADED = 'loaded';
    	var STATUS_FAILED = 'failed';

    	var SELECTOR = 'pre[data-src]:not([' + STATUS_ATTR + '="' + STATUS_LOADED + '"])'
    		+ ':not([' + STATUS_ATTR + '="' + STATUS_LOADING + '"])';

    	var lang = /\blang(?:uage)?-([\w-]+)\b/i;

    	/**
    	 * Sets the Prism `language-xxxx` or `lang-xxxx` class to the given language.
    	 *
    	 * @param {HTMLElement} element
    	 * @param {string} language
    	 * @returns {void}
    	 */
    	function setLanguageClass(element, language) {
    		var className = element.className;
    		className = className.replace(lang, ' ') + ' language-' + language;
    		element.className = className.replace(/\s+/g, ' ').trim();
    	}


    	Prism.hooks.add('before-highlightall', function (env) {
    		env.selector += ', ' + SELECTOR;
    	});

    	Prism.hooks.add('before-sanity-check', function (env) {
    		var pre = /** @type {HTMLPreElement} */ (env.element);
    		if (pre.matches(SELECTOR)) {
    			env.code = ''; // fast-path the whole thing and go to complete

    			pre.setAttribute(STATUS_ATTR, STATUS_LOADING); // mark as loading

    			// add code element with loading message
    			var code = pre.appendChild(document.createElement('CODE'));
    			code.textContent = LOADING_MESSAGE;

    			var src = pre.getAttribute('data-src');

    			var language = env.language;
    			if (language === 'none') {
    				// the language might be 'none' because there is no language set;
    				// in this case, we want to use the extension as the language
    				var extension = (/\.(\w+)$/.exec(src) || [, 'none'])[1];
    				language = EXTENSIONS[extension] || extension;
    			}

    			// set language classes
    			setLanguageClass(code, language);
    			setLanguageClass(pre, language);

    			// preload the language
    			var autoloader = Prism.plugins.autoloader;
    			if (autoloader) {
    				autoloader.loadLanguages(language);
    			}

    			// load file
    			var xhr = new XMLHttpRequest();
    			xhr.open('GET', src, true);
    			xhr.onreadystatechange = function () {
    				if (xhr.readyState == 4) {
    					if (xhr.status < 400 && xhr.responseText) {
    						// mark as loaded
    						pre.setAttribute(STATUS_ATTR, STATUS_LOADED);

    						// highlight code
    						code.textContent = xhr.responseText;
    						Prism.highlightElement(code);

    					} else {
    						// mark as failed
    						pre.setAttribute(STATUS_ATTR, STATUS_FAILED);

    						if (xhr.status >= 400) {
    							code.textContent = FAILURE_MESSAGE(xhr.status, xhr.statusText);
    						} else {
    							code.textContent = FAILURE_EMPTY_MESSAGE;
    						}
    					}
    				}
    			};
    			xhr.send(null);
    		}
    	});

    	Prism.plugins.fileHighlight = {
    		/**
    		 * Executes the File Highlight plugin for all matching `pre` elements under the given container.
    		 *
    		 * Note: Elements which are already loaded or currently loading will not be touched by this method.
    		 *
    		 * @param {ParentNode} [container=document]
    		 */
    		highlight: function highlight(container) {
    			var elements = (container || document).querySelectorAll(SELECTOR);

    			for (var i = 0, element; element = elements[i++];) {
    				Prism.highlightElement(element);
    			}
    		}
    	};

    	var logged = false;
    	/** @deprecated Use `Prism.plugins.fileHighlight.highlight` instead. */
    	Prism.fileHighlight = function () {
    		if (!logged) {
    			console.warn('Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead.');
    			logged = true;
    		}
    		Prism.plugins.fileHighlight.highlight.apply(this, arguments);
    	};

    })();
    });

    const blocks = '(if|else if|await|then|catch|each|html|debug)';

    Prism.languages.svelte = Prism.languages.extend('markup', {
    	each: {
    		pattern: new RegExp(
    			'{[#/]each' +
    				'(?:(?:\\{(?:(?:\\{(?:[^{}])*\\})|(?:[^{}]))*\\})|(?:[^{}]))*}'
    		),
    		inside: {
    			'language-javascript': [
    				{
    					pattern: /(as[\s\S]*)\([\s\S]*\)(?=\s*\})/,
    					lookbehind: true,
    					inside: Prism.languages['javascript'],
    				},
    				{
    					pattern: /(as[\s]*)[\s\S]*(?=\s*)/,
    					lookbehind: true,
    					inside: Prism.languages['javascript'],
    				},
    				{
    					pattern: /(#each[\s]*)[\s\S]*(?=as)/,
    					lookbehind: true,
    					inside: Prism.languages['javascript'],
    				},
    			],
    			keyword: /[#/]each|as/,
    			punctuation: /{|}/,
    		},
    	},
    	block: {
    		pattern: new RegExp(
    			'{[#:/@]/s' +
    				blocks +
    				'(?:(?:\\{(?:(?:\\{(?:[^{}])*\\})|(?:[^{}]))*\\})|(?:[^{}]))*}'
    		),
    		inside: {
    			punctuation: /^{|}$/,
    			keyword: [new RegExp('[#:/@]' + blocks + '( )*'), /as/, /then/],
    			'language-javascript': {
    				pattern: /[\s\S]*/,
    				inside: Prism.languages['javascript'],
    			},
    		},
    	},
    	tag: {
    		pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?:"[^"]*"|'[^']*'|{[\s\S]+?}(?=[\s/>])))|(?=[\s/>])))+)?\s*\/?>/i,
    		greedy: true,
    		inside: {
    			tag: {
    				pattern: /^<\/?[^\s>\/]+/i,
    				inside: {
    					punctuation: /^<\/?/,
    					namespace: /^[^\s>\/:]+:/,
    				},
    			},
    			'language-javascript': {
    				pattern: /\{(?:(?:\{(?:(?:\{(?:[^{}])*\})|(?:[^{}]))*\})|(?:[^{}]))*\}/,
    				inside: Prism.languages['javascript'],
    			},
    			'attr-value': {
    				pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/i,
    				inside: {
    					punctuation: [
    						/^=/,
    						{
    							pattern: /^(\s*)["']|["']$/,
    							lookbehind: true,
    						},
    					],
    					'language-javascript': {
    						pattern: /{[\s\S]+}/,
    						inside: Prism.languages['javascript'],
    					},
    				},
    			},
    			punctuation: /\/?>/,
    			'attr-name': {
    				pattern: /[^\s>\/]+/,
    				inside: {
    					namespace: /^[^\s>\/:]+:/,
    				},
    			},
    		},
    	},
    	'language-javascript': {
    		pattern: /\{(?:(?:\{(?:(?:\{(?:[^{}])*\})|(?:[^{}]))*\})|(?:[^{}]))*\}/,
    		lookbehind: true,
    		inside: Prism.languages['javascript'],
    	},
    });

    Prism.languages.svelte['tag'].inside['attr-value'].inside['entity'] =
    	Prism.languages.svelte['entity'];

    Prism.hooks.add('wrap', env => {
    	if (env.type === 'entity') {
    		env.attributes['title'] = env.content.replace(/&amp;/, '&');
    	}
    });

    Object.defineProperty(Prism.languages.svelte.tag, 'addInlined', {
    	value: function addInlined(tagName, lang) {
    		const includedCdataInside = {};
    		includedCdataInside['language-' + lang] = {
    			pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
    			lookbehind: true,
    			inside: Prism.languages[lang],
    		};
    		includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;

    		const inside = {
    			'included-cdata': {
    				pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
    				inside: includedCdataInside,
    			},
    		};
    		inside['language-' + lang] = {
    			pattern: /[\s\S]+/,
    			inside: Prism.languages[lang],
    		};

    		const def = {};
    		def[tagName] = {
    			pattern: RegExp(
    				/(<__[\s\S]*?>)(?:<!\[CDATA\[[\s\S]*?\]\]>\s*|[\s\S])*?(?=<\/__>)/.source.replace(
    					/__/g,
    					tagName
    				),
    				'i'
    			),
    			lookbehind: true,
    			greedy: true,
    			inside,
    		};

    		Prism.languages.insertBefore('svelte', 'cdata', def);
    	},
    });

    Prism.languages.svelte.tag.addInlined('style', 'css');
    Prism.languages.svelte.tag.addInlined('script', 'javascript');

    /* src\components\_code\Code.svelte generated by Svelte v3.31.2 */
    const file$4 = "src\\components\\_code\\Code.svelte";

    function create_fragment$7(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let pre;
    	let code;
    	let raw_value = (/*highlighted*/ ctx[0] || "") + "";

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			pre = element("pre");
    			code = element("code");
    			add_location(code, file$4, 23, 12, 813);
    			attr_dev(pre, "class", "p-4 text-gray-600 dark:text-gray-300 tr-200");
    			add_location(pre, file$4, 22, 10, 742);
    			attr_dev(div0, "class", "flex h-full");
    			add_location(div0, file$4, 19, 6, 678);
    			attr_dev(div1, "class", "code-grid-child svelte-1qt7ul9");
    			add_location(div1, file$4, 18, 4, 641);
    			attr_dev(div2, "class", "code-grid bg-white dark:bg-gray-800 tr-200 svelte-1qt7ul9");
    			add_location(div2, file$4, 17, 2, 579);
    			attr_dev(div3, "class", "rounded-lg overflow-hidden  text-xs leading-5 font-mono");
    			add_location(div3, file$4, 16, 0, 506);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, pre);
    			append_dev(pre, code);
    			code.innerHTML = raw_value;
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Code", slots, []);
    	let { source = "" } = $$props;
    	let { lang = "html" } = $$props;

    	// prettier-ignore
    	const svelteLang = prism.languages.svelte;

    	const html = prism.languages.html;
    	const css = prism.languages.css;

    	const highlighted = lang === "html"
    	? prism.highlight(source, html, "html")
    	: lang === "css"
    		? prism.highlight(source, css, "css")
    		: prism.highlight(source, svelteLang, "svelte");

    	const writable_props = ["source", "lang"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Code> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("source" in $$props) $$invalidate(1, source = $$props.source);
    		if ("lang" in $$props) $$invalidate(2, lang = $$props.lang);
    	};

    	$$self.$capture_state = () => ({
    		Prism: prism,
    		source,
    		lang,
    		svelteLang,
    		html,
    		css,
    		highlighted
    	});

    	$$self.$inject_state = $$props => {
    		if ("source" in $$props) $$invalidate(1, source = $$props.source);
    		if ("lang" in $$props) $$invalidate(2, lang = $$props.lang);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [highlighted, source, lang];
    }

    class Code extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { source: 1, lang: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Code",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get source() {
    		throw new Error("<Code>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set source(value) {
    		throw new Error("<Code>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lang() {
    		throw new Error("<Code>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lang(value) {
    		throw new Error("<Code>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Sandbox.svelte generated by Svelte v3.31.2 */

    function create_fragment$8(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Sandbox", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sandbox> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Sandbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sandbox",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\site\ButtonsTest.svelte generated by Svelte v3.31.2 */
    const file$5 = "src\\site\\ButtonsTest.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (34:12) <Button id={i} color={btn.color}>
    function create_default_slot_1(ctx) {
    	let t_value = /*btn*/ ctx[2].text + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(34:12) <Button id={i} color={btn.color}>",
    		ctx
    	});

    	return block;
    }

    // (32:8) {#each buttons as btn, i}
    function create_each_block_1(ctx) {
    	let span;
    	let button;
    	let t;
    	let current;

    	button = new Button({
    			props: {
    				id: /*i*/ ctx[4],
    				color: /*btn*/ ctx[2].color,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(button.$$.fragment);
    			t = space();
    			attr_dev(span, "class", "mr-4");
    			add_location(span, file$5, 32, 10, 1686);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(button, span, null);
    			append_dev(span, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(32:8) {#each buttons as btn, i}",
    		ctx
    	});

    	return block;
    }

    // (44:12) <Button id={i} color={btn.color} hasIcon={true}>
    function create_default_slot(ctx) {
    	let html_tag;
    	let raw_value = /*btn*/ ctx[2].icon + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(44:12) <Button id={i} color={btn.color} hasIcon={true}>",
    		ctx
    	});

    	return block;
    }

    // (42:8) {#each iconButtons as btn, i}
    function create_each_block$1(ctx) {
    	let span;
    	let button;
    	let t;
    	let current;

    	button = new Button({
    			props: {
    				id: /*i*/ ctx[4],
    				color: /*btn*/ ctx[2].color,
    				hasIcon: true,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(button.$$.fragment);
    			t = space();
    			attr_dev(span, "class", "mr-4");
    			add_location(span, file$5, 42, 10, 1968);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(button, span, null);
    			append_dev(span, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(42:8) {#each iconButtons as btn, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div3;
    	let div2;
    	let h20;
    	let t1;
    	let div0;
    	let t2;
    	let h21;
    	let t4;
    	let div1;
    	let current;
    	let each_value_1 = /*buttons*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*iconButtons*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Small Filled";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			h21 = element("h2");
    			h21.textContent = "Icon Buttons";
    			t4 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h20, "class", "h2");
    			add_location(h20, file$5, 29, 6, 1576);
    			attr_dev(div0, "class", "flex mb-4");
    			add_location(div0, file$5, 30, 6, 1616);
    			attr_dev(h21, "class", "h2");
    			add_location(h21, file$5, 39, 6, 1859);
    			attr_dev(div1, "class", "flex");
    			add_location(div1, file$5, 40, 6, 1899);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$5, 28, 2, 1545);
    			attr_dev(div3, "class", "flex items-center");
    			add_location(div3, file$5, 27, 0, 1510);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, h20);
    			append_dev(div2, t1);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, h21);
    			append_dev(div2, t4);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*buttons*/ 1) {
    				each_value_1 = /*buttons*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*iconButtons*/ 2) {
    				each_value = /*iconButtons*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ButtonsTest", slots, []);

    	let buttons = [
    		{ text: "Button 1", color: "blue" },
    		{ text: "Button 2", color: "red" },
    		{ text: "Button 3", color: "yellow" }
    	];

    	let iconButtons = [
    		{
    			text: "Button 1",
    			color: "blue",
    			icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /> </svg>`
    		},
    		{
    			text: "Button 1",
    			color: "red",
    			icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /> </svg>`
    		},
    		{
    			text: "Button 1",
    			color: "yellow",
    			icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" /> </svg>`
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ButtonsTest> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Button, buttons, iconButtons });

    	$$self.$inject_state = $$props => {
    		if ("buttons" in $$props) $$invalidate(0, buttons = $$props.buttons);
    		if ("iconButtons" in $$props) $$invalidate(1, iconButtons = $$props.iconButtons);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [buttons, iconButtons];
    }

    class ButtonsTest extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonsTest",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\site\TypographyTest.svelte generated by Svelte v3.31.2 */

    const file$6 = "src\\site\\TypographyTest.svelte";

    function create_fragment$a(ctx) {
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let h2;
    	let t5;
    	let p1;
    	let t7;
    	let small;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Heading 1";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati architecto voluptatibus quibusdam. Laborum assumenda animi id veniam, tempora error facilis eius ipsa tempore quos in illo voluptatibus officia cum adipisci. Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati architecto voluptatibus quibusdam. Laborum assumenda animi id veniam, tempora error facilis eius ipsa tempore quos in illo voluptatibus officia cum adipisci.";
    			t3 = space();
    			h2 = element("h2");
    			h2.textContent = "Heading 2";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati architecto voluptatibus quibusdam. Laborum assumenda animi id veniam, tempora error facilis eius ipsa tempore quos in illo voluptatibus officia cum adipisci. Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati architecto voluptatibus quibusdam. Laborum assumenda animi id veniam, tempora error facilis eius ipsa tempore quos in illo voluptatibus officia cum adipisci.";
    			t7 = space();
    			small = element("small");
    			small.textContent = "This is some small text.";
    			attr_dev(h1, "class", "h1 pb-4");
    			add_location(h1, file$6, 4, 4, 92);
    			attr_dev(p0, "class", "p pb-6");
    			add_location(p0, file$6, 5, 4, 132);
    			attr_dev(h2, "class", "h2 pb-4");
    			add_location(h2, file$6, 7, 4, 611);
    			attr_dev(p1, "class", "p pb-6");
    			add_location(p1, file$6, 8, 4, 651);
    			attr_dev(small, "class", "small");
    			add_location(small, file$6, 9, 4, 1128);
    			attr_dev(div0, "class", "container");
    			add_location(div0, file$6, 2, 2, 61);
    			attr_dev(div1, "class", "flex items-center");
    			add_location(div1, file$6, 1, 0, 26);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div0, t3);
    			append_dev(div0, h2);
    			append_dev(div0, t5);
    			append_dev(div0, p1);
    			append_dev(div0, t7);
    			append_dev(div0, small);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TypographyTest", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TypographyTest> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class TypographyTest extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TypographyTest",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\site\Header.svelte generated by Svelte v3.31.2 */

    const file$7 = "src\\site\\Header.svelte";

    function create_fragment$b(ctx) {
    	let header;
    	let div;
    	let h1;
    	let t0;
    	let t1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div = element("div");
    			h1 = element("h1");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(h1, "class", "title");
    			add_location(h1, file$7, 6, 4, 187);
    			attr_dev(div, "class", "flex justify-between items-center container");
    			add_location(div, file$7, 5, 2, 124);
    			attr_dev(header, "class", "flex items-center py-6");
    			add_location(header, file$7, 4, 0, 81);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(div, t1);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, ['default']);
    	let { title = "" } = $$props;
    	const writable_props = ["title"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ title });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, $$scope, slots];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { title: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get title() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\site\Layout.svelte generated by Svelte v3.31.2 */

    const file$8 = "src\\site\\Layout.svelte";
    const get_main_slot_changes = dirty => ({});
    const get_main_slot_context = ctx => ({});
    const get_nav_slot_changes = dirty => ({});
    const get_nav_slot_context = ctx => ({});

    function create_fragment$c(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let main;
    	let current;
    	const nav_slot_template = /*#slots*/ ctx[1].nav;
    	const nav_slot = create_slot(nav_slot_template, ctx, /*$$scope*/ ctx[0], get_nav_slot_context);
    	const main_slot_template = /*#slots*/ ctx[1].main;
    	const main_slot = create_slot(main_slot_template, ctx, /*$$scope*/ ctx[0], get_main_slot_context);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (nav_slot) nav_slot.c();
    			t = space();
    			main = element("main");
    			if (main_slot) main_slot.c();
    			attr_dev(div0, "class", "sidebar bg-white dark:bg-gray-800 tr-200 svelte-m351zg");
    			add_location(div0, file$8, 2, 2, 59);
    			attr_dev(main, "class", " bg-gray-100 dark:bg-gray-900 tr-200 svelte-m351zg");
    			add_location(main, file$8, 5, 2, 151);
    			attr_dev(div1, "class", "flex-1 app-grid svelte-m351zg");
    			add_location(div1, file$8, 1, 0, 26);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (nav_slot) {
    				nav_slot.m(div0, null);
    			}

    			append_dev(div1, t);
    			append_dev(div1, main);

    			if (main_slot) {
    				main_slot.m(main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (nav_slot) {
    				if (nav_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(nav_slot, nav_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_nav_slot_changes, get_nav_slot_context);
    				}
    			}

    			if (main_slot) {
    				if (main_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(main_slot, main_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_main_slot_changes, get_main_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav_slot, local);
    			transition_in(main_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav_slot, local);
    			transition_out(main_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (nav_slot) nav_slot.d(detaching);
    			if (main_slot) main_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layout", slots, ['nav','main']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Layout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\site\CodeTest.svelte generated by Svelte v3.31.2 */
    const file$9 = "src\\site\\CodeTest.svelte";

    function create_fragment$d(ctx) {
    	let div1;
    	let div0;
    	let code;
    	let current;

    	code = new Code({
    			props: {
    				source: /*svelteSource*/ ctx[0],
    				lang: "svelte"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(code.$$.fragment);
    			attr_dev(div0, "class", "container");
    			add_location(div0, file$9, 28, 2, 607);
    			attr_dev(div1, "class", "flex justify-center");
    			add_location(div1, file$9, 27, 0, 570);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(code, div0, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(code.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(code.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(code);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CodeTest", slots, []);

    	let svelteSource = `<script lang="ts">
  // Title
  export let title = ''
  console.log(title)
<\/script>

<!-- HEADER -->
<header class="flex items-center py-6">
  <div class="flex justify-between items-center container">
    <h1 class="title" on:click={() => console.log("Hello")}>
      {title}
    </h1>
    <slot></slot>
  </div>
</header>

<style>
  .bg-red {
    background-color: red;
  }
<\/style>`;

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CodeTest> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Code, svelteSource });

    	$$self.$inject_state = $$props => {
    		if ("svelteSource" in $$props) $$invalidate(0, svelteSource = $$props.svelteSource);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [svelteSource];
    }

    class CodeTest extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CodeTest",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.31.2 */

    const file$a = "src\\App.svelte";

    // (22:2) <div slot="nav" style="height: 100%">
    function create_nav_slot(ctx) {
    	let div;
    	let sidebar;
    	let updating_active;
    	let current;

    	function sidebar_active_binding(value) {
    		/*sidebar_active_binding*/ ctx[2].call(null, value);
    	}

    	let sidebar_props = { navItems: /*navItems*/ ctx[1] };

    	if (/*active*/ ctx[0] !== void 0) {
    		sidebar_props.active = /*active*/ ctx[0];
    	}

    	sidebar = new SideBar({ props: sidebar_props, $$inline: true });
    	binding_callbacks.push(() => bind(sidebar, "active", sidebar_active_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(sidebar.$$.fragment);
    			attr_dev(div, "slot", "nav");
    			set_style(div, "height", "100%");
    			add_location(div, file$a, 21, 2, 783);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(sidebar, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sidebar_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				sidebar_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active && dirty & /*active*/ 1) {
    				updating_active = true;
    				sidebar_changes.active = /*active*/ ctx[0];
    				add_flush_callback(() => updating_active = false);
    			}

    			sidebar.$set(sidebar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(sidebar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_nav_slot.name,
    		type: "slot",
    		source: "(22:2) <div slot=\\\"nav\\\" style=\\\"height: 100%\\\">",
    		ctx
    	});

    	return block;
    }

    // (28:4) <Header title={navItems[active].text}>
    function create_default_slot_1$1(ctx) {
    	let themetoggle;
    	let current;
    	themetoggle = new ThemeToggle({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(themetoggle.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(themetoggle, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(themetoggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(themetoggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(themetoggle, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(28:4) <Header title={navItems[active].text}>",
    		ctx
    	});

    	return block;
    }

    // (27:2) <span slot="main">
    function create_main_slot(ctx) {
    	let span;
    	let header;
    	let t;
    	let switch_instance;
    	let current;

    	header = new Header({
    			props: {
    				title: /*navItems*/ ctx[1][/*active*/ ctx[0]].text,
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	var switch_value = /*navItems*/ ctx[1][/*active*/ ctx[0]].component;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(header.$$.fragment);
    			t = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(span, "slot", "main");
    			add_location(span, file$a, 26, 2, 919);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(header, span, null);
    			append_dev(span, t);

    			if (switch_instance) {
    				mount_component(switch_instance, span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const header_changes = {};
    			if (dirty & /*active*/ 1) header_changes.title = /*navItems*/ ctx[1][/*active*/ ctx[0]].text;

    			if (dirty & /*$$scope*/ 8) {
    				header_changes.$$scope = { dirty, ctx };
    			}

    			header.$set(header_changes);

    			if (switch_value !== (switch_value = /*navItems*/ ctx[1][/*active*/ ctx[0]].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, span, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(header);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_main_slot.name,
    		type: "slot",
    		source: "(27:2) <span slot=\\\"main\\\">",
    		ctx
    	});

    	return block;
    }

    // (21:0) <Layout>
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(21:0) <Layout>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let tailwindcss;
    	let t0;
    	let typography;
    	let t1;
    	let tabmanager;
    	let t2;
    	let main;
    	let layout;
    	let current;
    	tailwindcss = new Tailwindcss({ $$inline: true });
    	typography = new Typography({ $$inline: true });
    	tabmanager = new TabManager({ $$inline: true });

    	layout = new Layout({
    			props: {
    				$$slots: {
    					default: [create_default_slot$1],
    					main: [create_main_slot],
    					nav: [create_nav_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tailwindcss.$$.fragment);
    			t0 = space();
    			create_component(typography.$$.fragment);
    			t1 = space();
    			create_component(tabmanager.$$.fragment);
    			t2 = space();
    			main = element("main");
    			create_component(layout.$$.fragment);
    			attr_dev(main, "class", "flex flex-col h-full w-full");
    			add_location(main, file$a, 19, 0, 727);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tailwindcss, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(typography, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tabmanager, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(layout, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const layout_changes = {};

    			if (dirty & /*$$scope, active*/ 9) {
    				layout_changes.$$scope = { dirty, ctx };
    			}

    			layout.$set(layout_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tailwindcss.$$.fragment, local);
    			transition_in(typography.$$.fragment, local);
    			transition_in(tabmanager.$$.fragment, local);
    			transition_in(layout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tailwindcss.$$.fragment, local);
    			transition_out(typography.$$.fragment, local);
    			transition_out(tabmanager.$$.fragment, local);
    			transition_out(layout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tailwindcss, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(typography, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tabmanager, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(main);
    			destroy_component(layout);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	const navItems = [
    		{ type: "heading", text: "utilities" },
    		{
    			type: "link",
    			text: "Typography",
    			component: TypographyTest
    		},
    		{ type: "heading", text: "components" },
    		{
    			type: "link",
    			text: "Buttons",
    			component: ButtonsTest
    		},
    		{
    			type: "link",
    			text: "Code",
    			component: CodeTest
    		},
    		{
    			type: "link",
    			text: "Sandbox",
    			component: Sandbox
    		}
    	];

    	let active = 4;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function sidebar_active_binding(value) {
    		active = value;
    		$$invalidate(0, active);
    	}

    	$$self.$capture_state = () => ({
    		Tailwindcss,
    		ThemeToggle,
    		SideBar,
    		Typography,
    		TabManager,
    		Sandbox,
    		Sbar,
    		ButtonsTest,
    		CodeTest,
    		TypographyTest,
    		Layout,
    		Header,
    		navItems,
    		active
    	});

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [active, navItems, sidebar_active_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
